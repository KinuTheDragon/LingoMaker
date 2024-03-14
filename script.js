
const COLORS = {
    white: "#e6e7e8",
    black: "#000000",
    red: "#b82337",
    orange: "#e07e00",
    yellow: "#ffff00",
    green: "#108e29",
    blue: "#003685",
    purple: "#7100a5",
    brown: "#774d2b",
    mint: "#7fffc5",
    magenta: "#ff00dc",
    lime: "#00ff21",
    gray: "#a0a0a0",
    cream: "#f7e4b6",
    lavender: "#a288dc",
    auburn: "#840707",
    honeycomb: "#faa349",
    brass: "linear-gradient(#8c8651, #6c6035)",
    cobalt: "#2400e0",
    cyan: "#00ffff",
    glass: "repeating-linear-gradient(-45deg, #cccccc 0 15%, #eeeeee 15% 20%)",
    "matte black": "repeating-linear-gradient(-45deg, #000000 0 10%, #555555 10% 20%)",
    "pastel green": "#d3fac2",
    pink: "#d361c4",
    plum: "#991b51",
    salmon: "#ffc3c3",
    silver: "#bec2cb",
    "tea green": "#77dd77",
    avocado: "#0d363a",
    none: "#444"
};
const SUCCESS_AUDIO = new Audio("success.wav");
const WIN_AUDIO = new Audio("win.mp3");

let puzzle = {cols: 1, rows: 3, title: "Puzzle", blocks: []};

let isEditMode = false;
function toggleEditMode() {
    isEditMode = !isEditMode;
    document.getElementById("editToggle").firstChild.textContent =
        isEditMode ? "Play" : "Edit";
    updateDisabled();
    displayPuzzle();
}

function play(audio) {
    audio.pause();
    audio.currentTime = 0;
    setTimeout(() => audio.play(), 150);
}

function displayPuzzle() {
    if (isEditMode) {
        let title = document.getElementById("title");
        title.removeChild(title.firstChild);
        let titleInput = document.createElement("input");
        titleInput.placeholder = "Title";
        titleInput.value = puzzle.title || "Puzzle";
        titleInput.addEventListener("input", e => {
            puzzle.title = titleInput.value || "Puzzle";
        });
        title.appendChild(titleInput);
    } else {
        let title = document.getElementById("title");
        title.removeChild(title.firstChild);
        title.appendChild(document.createTextNode(puzzle.title || "Puzzle"));
    }
    let puzzleDisplay = document.getElementById("puzzle");
    puzzleDisplay.classList.remove("win");
    while (puzzleDisplay.firstChild)
        puzzleDisplay.removeChild(puzzleDisplay.firstChild);
    let rows = [];
    for (let y = 0; y < puzzle.rows; y++) {
        let blockRow = [];
        let row = document.createElement("tr");
        for (let x = 0; x < puzzle.cols; x++) {
            let block = document.createElement("td");
            block.classList.add("no-block");
            blockRow.push(block);
            row.appendChild(block);
        }
        rows.push(blockRow);
        puzzleDisplay.appendChild(row);
    }
    for (let i = 0; i < puzzle.blocks.length; i++) {
        let block = puzzle.blocks[i];
        let blockCell = rows[block.y][block.x];
        blockCell.classList.remove("no-block");
        blockCell.classList.add("block");
        blockCell.setAttribute("index", i);
        if (block.color1) {
            blockCell.classList.add("checkered");
            for (let i = 0; i < 4; i++) {
                let checker = document.createElement("div");
                checker.classList.add("checker" + i);
                checker.classList.add("checker");
                blockCell.appendChild(checker);
            }
        }
        for (let key of ["color", "color1", "color2"]) {
            if (block[key])
                blockCell.style.setProperty(
                    "--" + key, COLORS[block[key]] ?? block[key]
                );
        }
        if (isEditMode) {
            let clueInput = document.createElement("input");
            block.clueInput = clueInput;
            clueInput.classList.add("clue");
            clueInput.value = block.clue;
            blockCell.appendChild(clueInput);
            clueInput.setAttribute("index", i);
            blockCell.appendChild(document.createElement("br"));
            let input = document.createElement("input");
            block.input = input;
            input.classList.add("answer");
            input.value = block.answer ?? "";
            blockCell.appendChild(input);
            input.setAttribute("index", i);
        } else {
            blockCell.appendChild(
                document.createTextNode(block.clue.toUpperCase())
            );
            if (!block.clue) blockCell.classList.add("no-panel");
            if (block.answer) {
                blockCell.appendChild(document.createElement("br"));
                let input = document.createElement("input");
                block.input = input;
                input.classList.add("answer");
                input.placeholder = block.answer.split("`")[0].replaceAll(/[a-zA-Z0-9]/g, "-");
                blockCell.appendChild(input);
                input.setAttribute("index", i);
            }
        }
        let rect = blockCell.getBoundingClientRect();
        let fontSize = 15;
        while (rect.height > 114 || rect.width > 114) {
            blockCell.style.fontSize = fontSize + "px";
            fontSize--;
            rect = blockCell.getBoundingClientRect();
        }
        blockCell.style.whiteSpace = "nowrap";
        rect = blockCell.getBoundingClientRect();
        while (rect.height > 114 || rect.width > 114) {
            blockCell.style.fontSize = fontSize + "px";
            fontSize--;
            rect = blockCell.getBoundingClientRect();
        }
    }
    if (isEditMode) {
        document.querySelectorAll("input.clue").forEach(
            i => i.addEventListener("keyup", e => {
                let block = puzzle.blocks[i.getAttribute("index")];
                block.clue = i.value;
            })
        );
        document.querySelectorAll("input.answer").forEach(
            i => i.addEventListener("keyup", e => {
                let block = puzzle.blocks[i.getAttribute("index")];
                block.answer = i.value;
            })
        );
        document.querySelectorAll(".no-block").forEach(
            n => n.addEventListener("click", e => {
                const index = d => [...d.parentNode.childNodes].indexOf(d);
                let x = index(n);
                let y = index(n.parentNode);
                let checkered = document.getElementById("checker").checked;
                let color1 = document.getElementById("namedColors").value;
                color1 = color1 === "$HEX" ?
                    document.getElementById("hexColor1").value : color1;
                let color2 = document.getElementById("namedColors2").value;
                color2 = color2 === "$HEX" ?
                    document.getElementById("hexColor2").value : color2;
                let block = {
                    clue: "clue",
                    x, y
                };
                if (checkered) {
                    block.color1 = color1;
                    block.color2 = color2;
                } else {
                    block.color = color1;
                }
                puzzle.blocks.push(block);
                displayPuzzle();
            })
        );
        document.querySelectorAll(".block").forEach(
            b => {
                b.addEventListener("contextmenu", e => {
                    e.preventDefault();
                    puzzle.blocks.splice(+b.getAttribute("index"), 1);
                    displayPuzzle();
                });
                b.addEventListener("click", e => {
                    if (e.target !== b) return;
                    let block = puzzle.blocks[b.getAttribute("index")];
                    let checkered = document.getElementById("checker").checked;
                    let color1 = document.getElementById("namedColors").value;
                    color1 = color1 === "$HEX" ?
                        document.getElementById("hexColor1").value : color1;
                    let color2 = document.getElementById("namedColors2").value;
                    color2 = color2 === "$HEX" ?
                        document.getElementById("hexColor2").value : color2;
                    if (checkered) {
                        block.color = undefined;
                        block.color1 = color1;
                        block.color2 = color2;
                    } else {
                        block.color = color1;
                        block.color1 = undefined;
                        block.color2 = undefined;
                    }
                    displayPuzzle();
                });
            }
        );
    } else {
        document.querySelectorAll("input.answer").forEach(
            i => i.addEventListener("input", e => {
                let guess = i.value.toUpperCase();
                let block = puzzle.blocks[i.getAttribute("index")];
                if (guess.length > block.answer.split("`")[0].length)
                    i.value = i.value.slice(block.answer.split("`")[0].length);
                puzzle.blocks
                    .filter(block2 => block.x === block2.x && block !== block2)
                    .forEach(block2 => {
                        if (block2.input)
                            block2.input.value = i.value;
                    });
                puzzle.blocks.filter(b => b.answer).forEach(b => {
                    b.input.classList.remove("failure");
                    let wasSuccess = b.input.classList.contains("success");
                    b.input.classList.remove("success");
                    let guess = b.input.value.toUpperCase();
                    let answers = b.answer.split("`").map(x=>x.toUpperCase());
                    if (answers.includes(guess)) {
                        b.input.classList.add("success");
                        if (!wasSuccess)
                            play(SUCCESS_AUDIO);
                    } else if (guess.length >= answers[0].length) {
                        b.input.classList.add("failure");
                    }
                });
                let puzzleElement = document.getElementById("puzzle");
                let wasWin = puzzleElement.classList.contains("win");
                puzzleElement.classList.remove("win");
                if (puzzle.blocks.every(
                    x => !x.answer || x.input.classList.contains("success")
                )) {
                    puzzleElement.classList.add("win");
                    if (!wasWin)
                        play(WIN_AUDIO);
                }
            })
        );
    }
    let link = document.getElementById("linkBtn");
    let part = compressPuzzle().replaceAll(/=+$/g, "").replaceAll("+", "-").replaceAll("/", "_");
    let url = location.href.split("?")[0] + "?" + part;
    link.setAttribute("url", url);
}

function setup() {
    let part = location.search.slice(1).replaceAll("-", "+").replaceAll("_", "/");
    part = part.padEnd(Math.ceil(part.length / 4) * 4, "=");
    loadCompressedPuzzle(part);
    displayPuzzle();
    updateDisabled();
    let namedColors = document.getElementById("namedColors");
    let namedColors2 = document.getElementById("namedColors2");
    for (let c in COLORS) {
        for (let nc of [namedColors, namedColors2]) {
            let name = c.replaceAll(/\b([a-z])/g, (_, x) => x.toUpperCase());
            let option = document.createElement("option");
            option.appendChild(document.createTextNode(name));
            option.value = c;
            nc.appendChild(option);
        }
    }
}

function updateDisabled() {
    document.querySelectorAll("input, select, button")
        .forEach(x => {x.disabled = false;});
    if (!isEditMode)
        document.querySelectorAll(".editBtn")
            .forEach(x => {x.disabled = true;});
    if (document.getElementById("namedColors").value !== "$HEX")
        document.getElementById("hexColor1").disabled = true;
    if (document.getElementById("namedColors2").value !== "$HEX")
        document.getElementById("hexColor2").disabled = true;
    if (!document.getElementById("checker").checked) {
        document.getElementById("swap").disabled = true;
        document.getElementById("namedColors2").disabled = true;
        document.getElementById("hexColor2").disabled = true;
    }
}
setInterval(updateDisabled, 1);

function swapColors() {
    let nc1 = document.getElementById("namedColors");
    let nc2 = document.getElementById("namedColors2");
    let x = nc1.value;
    nc1.value = nc2.value;
    nc2.value = x;
    let hc1 = document.getElementById("hexColor1");
    let hc2 = document.getElementById("hexColor2");
    x = hc1.value;
    hc1.value = hc2.value;
    hc2.value = x;
}

function addColLeft() {
    puzzle.cols++;
    puzzle.blocks.forEach(b => {b.x++;});
    displayPuzzle();
}

function addColRight() {
    puzzle.cols++;
    displayPuzzle();
}

function removeColLeft() {
    if (puzzle.cols > 1) {
        puzzle.cols--;
        puzzle.blocks.forEach(b => {b.x--;});
        puzzle.blocks = puzzle.blocks.filter(b => b.x >= 0);
        displayPuzzle();
    }
}

function removeColRight() {
    if (puzzle.cols > 1) {
        puzzle.cols--;
        puzzle.blocks = puzzle.blocks.filter(b => b.x < puzzle.cols);
        displayPuzzle();
    }
}

function addRowTop() {
    puzzle.rows++;
    puzzle.blocks.forEach(b => {b.y++;});
    displayPuzzle();
}

function addRowBottom() {
    puzzle.rows++;
    displayPuzzle();
}

function removeRowTop() {
    if (puzzle.rows > 3) {
        puzzle.rows--;
        puzzle.blocks.forEach(b => {b.y--;});
        puzzle.blocks = puzzle.blocks.filter(b => b.y >= 0);
        displayPuzzle();
    }
}

function removeRowBottom() {
    if (puzzle.rows > 3) {
        puzzle.rows--;
        puzzle.blocks = puzzle.blocks.filter(b => b.y < puzzle.rows);
        displayPuzzle();
    }
}

function loadCompressedPuzzle(data) {
    try {
        let arr = new Uint8Array([...atob(data)].map(x => x.charCodeAt(0)));
        let inflated = pako.inflate(arr);
        let output = [...inflated].map(x => String.fromCharCode(x)).join("");
        puzzle = JSON.parse(output);
    } catch (err) {
        puzzle = {cols: 1, rows: 3, title: "Puzzle", blocks: []};
    }
}

function compressPuzzle() {
    let output = {
        cols: puzzle.cols,
        rows: puzzle.rows,
        blocks: [],
        title: puzzle.title
    };
    for (let block of puzzle.blocks) {
        let outputBlock = {
            clue: block.clue,
            x: block.x,
            y: block.y
        };
        if (block.color) outputBlock.color = block.color;
        else {
            outputBlock.color1 = block.color1;
            outputBlock.color2 = block.color2;
        }
        if (block.answer) outputBlock.answer = block.answer;
        output.blocks.push(outputBlock);
    }
    let base64d = JSON.stringify(output);
    let arr = new Uint8Array([...base64d].map(x => x.charCodeAt(0)));
    return btoa([...pako.deflate(arr)]
                .map(x => String.fromCharCode(x)).join(""));
}

document.addEventListener("mousemove", e => {
    let hovered = document.querySelector("td.block:hover");
    let hoveredColor;
    if (hovered) {
        let block = puzzle.blocks[hovered.getAttribute("index")];
        if (block.color) {
            hoveredColor = block.color.replaceAll(/\b([a-z])/g, (_, x) => x.toUpperCase());
        } else {
            hoveredColor = "Checkered - " + block.color1.replaceAll(/\b([a-z])/g, (_, x) => x.toUpperCase()) + " and " + block.color2.replaceAll(/\b([a-z])/g, (_, x) => x.toUpperCase());
        }
    } else {
        hoveredColor = "No color";
    }
    document.getElementById("hovered").innerText = hoveredColor;
});

const HIDDEN_CHARS = /[a-zA-Z0-9]/g;

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
    monochrome: "linear-gradient(#000000, #ffffff)",
    "golden coral": "linear-gradient(#ffac18, #fb5a17)",
    ketchup: "#861700",
    mustard: "#7f670a",
    relish: "#2a5203",
    "anti-silver": "#2f2d51",
    burgundy: "#4d0340",
    none: "#444"
};
const DUAL_TYPE_NAMES = {
    checker: "Checkered",
    vhalf: "Vertical halves",
    hhalf: "Horizontal halves",
    cvhalf: "Centered vertical halves",
    chhalf: "Centered horizontal halves"
}
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

let isFirstPlay = true;
function play(audio) {
    audio.pause();
    audio.currentTime = 0;
    if (isFirstPlay) isFirstPlay = false;
    else setTimeout(() => audio.play(), 150);
}

function canHavePanel(shape) {
    if (shape.startsWith("pipe")) return false;
    return true;
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
    document.getElementById("linkthem").checked = puzzle.linkedColumns;
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
            blockCell.classList.add("dual-" + (block.dualType ?? "checker"));
            switch (block.dualType ?? "checker") {
                case "checker":
                    for (let i = 0; i < 4; i++) {
                        let checker = document.createElement("div");
                        checker.classList.add("checker" + i);
                        checker.classList.add("checker");
                        blockCell.appendChild(checker);
                    }
                    break;
                case "hhalf":
                case "vhalf":
                    for (let i = 0; i < 2; i++) {
                        let half = document.createElement("div");
                        half.classList.add(block.dualType + i);
                        half.classList.add(block.dualType);
                        blockCell.appendChild(half);
                    }
                    break;
                case "chhalf":
                case "cvhalf":
                    for (let i = 0; i < 3; i++) {
                        let half = document.createElement("div");
                        half.classList.add(block.dualType + i);
                        half.classList.add(block.dualType);
                        blockCell.appendChild(half);
                    }
                    break;
            }
        }
        for (let key of ["color", "color1", "color2"]) {
            if (block[key])
                blockCell.style.setProperty(
                    "--" + key, COLORS[block[key]] ?? block[key]
                );
        }
        if (isEditMode) {
            if (block.shape && block.shape !== "block") {
                blockCell.classList.add("shape-" + block.shape);
                if (!canHavePanel(block.shape))
                    blockCell.classList.add("no-panel");
            } else {
                let clueInput = document.createElement("input");
                clueInput.tabIndex = (block.x * 3 + block.y) * 2 + 1;
                block.clueInput = clueInput;
                clueInput.classList.add("clue");
                clueInput.value = block.clue;
                blockCell.appendChild(clueInput);
                clueInput.setAttribute("index", i);
                blockCell.appendChild(document.createElement("br"));
                let input = document.createElement("input");
                input.tabIndex = (block.x * 3 + block.y) * 2 + 2;
                block.input = input;
                input.classList.add("answer");
                input.value = block.answer ?? "";
                blockCell.appendChild(input);
                input.setAttribute("index", i);
            }
        } else {
            blockCell.appendChild(
                document.createTextNode(block.clue.toUpperCase())
            );
            if (!block.clue && !block.answer) blockCell.classList.add("no-panel");
            if (block.shape && block.shape !== "block")
                blockCell.classList.add("shape-" + block.shape);
            if (block.answer) {
                blockCell.appendChild(document.createElement("br"));
                let input = document.createElement("input");
                input.tabIndex = block.x * 3 + block.y + 1;
                block.input = input;
                input.classList.add("answer");
                input.placeholder = block.answer.split("`")[0].replaceAll(HIDDEN_CHARS, "-");
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
                let dualType = document.getElementById("duals").value;
                let color1 = document.getElementById("namedColors").value;
                color1 = color1 === "$HEX" ?
                    document.getElementById("hexColor1").value : color1;
                let color2 = document.getElementById("namedColors2").value;
                color2 = color2 === "$HEX" ?
                    document.getElementById("hexColor2").value : color2;
                let block = {
                    clue: "clue",
                    dualType,
                    x, y
                };
                if (dualType) {
                    block.color1 = color1;
                    block.color2 = color2;
                } else {
                    block.color = color1;
                }
                block.shape = document.getElementById("shape").value;
                if (!canHavePanel(block.shape)) block.clue = "";
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
                b.addEventListener("auxclick", e => {
                    let block = puzzle.blocks[b.getAttribute("index")];
                    let dualType = block.dualType;
                    document.getElementById("duals").value = block.color1 ? (dualType ?? "checker") : "";
                    document.getElementById("shape").value = block.shape ?? "block";
                    if (dualType) {
                        if (block.color1.startsWith("#")) {
                            document.getElementById("hexColor1").value = block.color1;
                            document.getElementById("namedColors").value = "$HEX";
                        } else {
                            document.getElementById("namedColors").value = block.color1;
                        }
                        if (block.color2.startsWith("#")) {
                            document.getElementById("hexColor2").value = block.color2;
                            document.getElementById("namedColors2").value = "$HEX";
                        } else {
                            document.getElementById("namedColors2").value = block.color2;
                        }
                    } else {
                        if (block.color.startsWith("#")) {
                            document.getElementById("hexColor1").value = block.color;
                            document.getElementById("namedColors").value = "$HEX";
                        } else {
                            document.getElementById("namedColors").value = block.color;
                        }
                    }
                });
                b.addEventListener("click", e => {
                    if (e.target !== b) return;
                    let block = puzzle.blocks[b.getAttribute("index")];
                    let dualType = document.getElementById("duals").value;
                    let color1 = document.getElementById("namedColors").value;
                    color1 = color1 === "$HEX" ?
                        document.getElementById("hexColor1").value : color1;
                    let color2 = document.getElementById("namedColors2").value;
                    color2 = color2 === "$HEX" ?
                        document.getElementById("hexColor2").value : color2;
                    if (dualType) {
                        block.color = undefined;
                        block.color1 = color1;
                        block.color2 = color2;
                    } else {
                        block.color = color1;
                        block.color1 = undefined;
                        block.color2 = undefined;
                    }
                    block.dualType = dualType;
                    block.shape = document.getElementById("shape").value;
                    if (!canHavePanel(block.shape)) {
                        block.clue = "";
                        block.answer = "";
                    }
                    displayPuzzle();
                });
            }
        );
    } else {
        document.querySelectorAll("input.answer").forEach(
            i => {
                i.addEventListener("input", e => {
                    let guess = i.value.toUpperCase();
                    let block = puzzle.blocks[i.getAttribute("index")];
                    if (normalizeText(guess).length > normalizeText(block.answer.split("`")[0]).length)
                        i.value = i.value.slice(block.answer.split("`")[0].length);
                    if (puzzle.linkedColumns)
                        puzzle.blocks
                            .filter(block2 => block.x === block2.x && block !== block2)
                            .forEach(block2 => {
                                if (block2.input)
                                    block2.input.value = i.value;
                            });
                    updateSuccess();
                });
                i.addEventListener("keyup", e => {
                    if (e.code !== "Insert") return;
                    let block = puzzle.blocks[i.getAttribute("index")];
                    let answer = block.answer.split("`")[0];
                    let index = HIDDEN_CHARS.exec(answer).index;
                    let hinted = answer.slice(0, index + 1) + answer.slice(index + 1).replaceAll(HIDDEN_CHARS, "-");
                    i.placeholder = hinted;
                });
                i.parentNode.addEventListener("contextmenu", e => {
                    e.preventDefault();
                    let block = puzzle.blocks[i.getAttribute("index")];
                    let answer = block.answer.split("`")[0];
                    let index = HIDDEN_CHARS.exec(answer).index;
                    let hinted = answer.slice(0, index + 1) + answer.slice(index + 1).replaceAll(HIDDEN_CHARS, "-");
                    i.placeholder = hinted;
                });
            }
        );
    }
    let link = document.getElementById("linkBtn");
    let part = compressPuzzle().replaceAll(/=+$/g, "").replaceAll("+", "-").replaceAll("/", "_");
    let url = location.href.split("?")[0] + "?" + part;
    link.setAttribute("url", url);
    updateSuccess();
}

function normalizeText(text) {
    return text.replaceAll(/ +/g, "").replaceAll(/[‘’]/g, "'").replaceAll(/[“”]/g, '"');
}

function updateSuccess() {
    if (isEditMode) return;
    puzzle.blocks.filter(b => b.answer).forEach(b => {
        b.input.classList.remove("failure");
        let wasSuccess = b.input.classList.contains("success");
        b.input.classList.remove("success");
        let guess = normalizeText(b.input.value.toUpperCase());
        let answers = b.answer.split("`").map(x => x.toUpperCase());
        let found = false;
        for (let answer of answers) {
            if (normalizeText(answer) === guess) {
                b.input.classList.add("success");
                if (!wasSuccess) {
                    b.input.value = answer;
                    play(SUCCESS_AUDIO);
                }
                found = true;
                break;
            }
        }
        if (!found && guess.length >= answers[0].length) {
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
    if (!document.getElementById("duals").value) {
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

document.getElementById("linkthem").addEventListener("input", e => {
    puzzle.linkedColumns = e.target.checked;
});

function loadCompressedPuzzle(data) {
    try {
        let arr = new Uint8Array([...atob(data)].map(x => x.charCodeAt(0)));
        let inflated = pako.inflate(arr);
        let output = [...inflated].map(x => String.fromCharCode(x)).join("");
        puzzle = JSON.parse(output);
        puzzle.linkedColumns = true;
        switch (puzzle.version) {
            case 2:
                puzzle.linkedColumns = b.linked;
            case 1:
                puzzle.title = unescape(atob(puzzle.title));
                puzzle.blocks.forEach(b => {
                    b.clue = unescape(atob(b.clue));
                    if (b.answer)
                        b.answer = unescape(atob(b.answer));
                });
        }
    } catch (err) {
        puzzle = {
            cols: 1, rows: 3,
            title: "Puzzle", blocks: [],
            linkedColumns: true
        };
    }
}

function compressPuzzle() {
    let output = {
        cols: puzzle.cols,
        rows: puzzle.rows,
        blocks: [],
        title: btoa(escape(puzzle.title)),
        linked: puzzle.linkedColumns,
        version: 2
    };
    for (let block of puzzle.blocks) {
        let outputBlock = {
            clue: btoa(escape(block.clue)),
            x: block.x,
            y: block.y,
            shape: block.shape
        };
        if (block.color) outputBlock.color = block.color;
        else {
            outputBlock.color1 = block.color1;
            outputBlock.color2 = block.color2;
            outputBlock.dualType = block.dualType ?? "checker";
        }
        if (block.answer) outputBlock.answer = btoa(escape(block.answer));
        output.blocks.push(outputBlock);
    }
    let json = JSON.stringify(output);
    let arr = new Uint8Array([...json].map(x => x.charCodeAt(0)));
    return btoa([...pako.deflate(arr)]
                .map(x => String.fromCharCode(x)).join(""));
}

function copyPuzzleLink() {
    let btn = document.getElementById("linkBtn");
    if (isEditMode) {
        displayPuzzle();
    } else {
        let answers = [...document.querySelectorAll("input.answer")].map(x =>  x.value);
        displayPuzzle();
        document.querySelectorAll("input.answer").forEach((x, i) => {x.value = answers[i];});
        updateSuccess();
    }
    navigator.clipboard.writeText(
        btn.getAttribute("url")
    );
    btn.textContent = "Copied!";
    setTimeout(() => {btn.textContent = "Copy puzzle link";}, 500);
}

document.addEventListener("mousemove", e => {
    let hovered = document.querySelector("td.block:hover");
    let hoveredColor;
    if (hovered) {
        let block = puzzle.blocks[hovered.getAttribute("index")];
        if (block.color) {
            hoveredColor = block.color.replaceAll(/\b([a-z])/g, (_, x) => x.toUpperCase());
        } else {
            let dualTypeName = DUAL_TYPE_NAMES[block.dualType ?? "checker"];
            hoveredColor = dualTypeName + " - " + block.color1.replaceAll(/\b([a-z])/g, (_, x) => x.toUpperCase()) + " and " + block.color2.replaceAll(/\b([a-z])/g, (_, x) => x.toUpperCase());
        }
    } else {
        hoveredColor = "No color";
    }
    document.getElementById("hovered").innerText = hoveredColor;
});

function createParticle() {
    const puzzle = document.querySelector("#puzzle.win");
    if (!puzzle) return;
    const rect = puzzle.getBoundingClientRect();
    const randX = Math.random() * rect.width + rect.left;
    const randY = Math.random() * rect.height + rect.top;
    const randSign = Math.floor(Math.random() * 2) * 2 - 1;
    let x, y;
    let dxSign, dySign;
    switch (Math.floor(Math.random() * 4)) {
        case 0:
            x = randX;
            y = rect.top;
            dxSign = randSign;
            dySign = -1;
            break;
        case 1:
            x = randX;
            y = rect.bottom;
            dxSign = randSign;
            dySign = 1;
            break;
        case 2:
            x = rect.left;
            y = randY;
            dxSign = -1;
            dySign = randSign;
            break;
        case 3:
            x = rect.right;
            y = randY;
            dxSign = 1;
            dySign = randSign;
            break;
    }
    const particle = document.createElement("div");
    particle.classList.add("particle");
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.setProperty("--dx", Math.random() * 100 * dxSign);
    particle.style.setProperty("--dy", Math.random() * 100 * dySign);
    document.getElementById("particles").appendChild(particle);
    particle.addEventListener("animationend", () => {
        particle.remove();
    });
}

setInterval(createParticle, 1);
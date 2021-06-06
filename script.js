function block(text, config, inserts, loop) {
  return {
    "text": text,
    "config": config,
    "inserts": inserts,
    "loop": loop,
  }
}

function input(text, input) {
  return {
    "text": text,
    "input": input,
  }
}

const test = [
  block("quando @greenFlag for clicado", "hat events"),
  block("ande $ passos", "motion", [
    block("velocidade", "variables reporter")
  ]),
  block("se $ então", null, [
    block("$ = $", "operators boolean", [
      input("10", "text"),
      input("10", "text"),
    ])
  ], "start"),
  block("gire ↺ $ graus", "motion", [
    input("10", "number")
  ]),
  block(null, "control", null, "end"),
  block("sempre", null, null, "start"),
  block("se $ então", null, [
    block("$ = $", "operators boolean", [
      input("10", "text"),
      input("10", "text"),
    ])
  ], "start"),
  block("gire ↺ $ graus", "motion", [
    input("10", "number")
  ]),
  block("senão", null, null, "middle"),
  block("gire ↻ $ graus", "motion", [
    input("10", "number")
  ]),
  block(null, "control", null, "end"),
  block("@loopArrow", "control cap", null, "end")
];

document.querySelector("pre.blocks").textContent = toScratchBlocks(test);
scratchblocks.renderMatching('pre.blocks');

toHTML(test, document.querySelector(".edit"));

function toScratchBlocks(blocks, isInsert) {
  let final = "";

  blocks.forEach(item => {
    let line = ""

    // Adicione o texto à linha
    if (item.text !== null) {
      line += item.text;

      // Se há outros blocos inseridos nesse,
      // converta-os e substitua os símbolos $
      if (item.inserts) {
        for (let i = 0; i < item.inserts.length; i++) {
          line = line.replace("$", toScratchBlocks([item.inserts[i]], true));
        }
      }
    }

    // Adicione as configurações de estilo depois do texto
    if (item.config) {
      // Extensões são um caso especial
      const config = item.config.replace("extension", "#0fbd8c")
      line += " :: " + item.config;
    }

    // Adicione os parênteses se for uma
    // caixa de entrada de texto
    if (item.input) {
      switch (item.input) {
        case "number":
          line = "(" + line + ")";
          break;
        case "select-number":
          line = "(" + line + " v)";
          break;
        case "text":
          line = "[" + line + "]";
          break;
        case "select-text":
          line = "[" + line + " v]";
          break;
      }
    }

    // Adicione colchetes se for um loop
    if (item.loop) {
      switch (item.loop) {
        case "start":
          line = line + " {";
          break;
        case "middle":
          line = "} " + line + " {";
          break;
        case "end":
          line = "} " + line;
          break;
      }
    }

    // Adicione a linha à string final
    final += line;

    // Adicione uma nova linha se essa linha for um loop
    // ou tiver configurações de estilo abertas
    if ((item.config && !isInsert) || item.loop) {
      final += "\n";
    }

    // Se esse bloco estiver dentro de outro,
    // adicione parênteses
    if (isInsert && !item.input) {
      final = "(" + final + ")";
    }
  });

  // Remova espaços a mais
  final = final.replaceAll("  ", " ");

  return final;
}

function toHTML(blocks, parent, isInsert, textArr) {
  console.log("==========");
  console.log(JSON.stringify(blocks));

  let skipNext = 0;
  let unstyledLoops = []

  blocks.forEach((item, index) => {
    if (skipNext > 0) {
      skipNext -= 1;
      return;
    }
    let node = document.createElement("div");

    // Adicione o texto ao bloco
    if (item.text !== null) {
      let myText = item.text;

      // Adicione um triangulinho se o input for
      // de tipo select
      if (item.input && item.input.includes("select")) {
        myText += " ▾";
      }

      myText = myText.split("$");

      // Se há outros blocos inseridos nesse,
      // converta-os e substitua os símbolos $
      if (item.inserts) {
        toHTML(item.inserts, node, true, myText);
        node.insertAdjacentText("beforeend", myText[myText.length - 1]);
      } else {
        node.textContent = myText;
      }
    }

    // Adicione as configurações de estilo
    if (item.config) {
      node.className = "block " + item.config;
    }

    if (item.input) {
      node.className = "input " + item.config;
    }

    // Deixe o bloco arredondado se precisar
    if (item.input && item.input.includes("number")) {
      node.className += " number";
    }

    // Se o bloco estiver inserido em outro, adicione
    // a classe inline
    if (isInsert) {
      node.className += " inline";
    }

    // Adicione próximos como filhos se for um loop
    if (item.loop) {
      switch (item.loop) {
        case "start":
        case "middle":
          unstyledLoops.push(node);
          let children = [];
          for (let i = index + 1; i < blocks.length; i++) {
            if (blocks[i].loop) {
              if (blocks[i].loop != "start") {
                break;
              }
            }
            children.push(blocks[i]);
            skipNext += 1;
          }
          toHTML(children, node);
          break;
        case "end":
          unstyledLoops.forEach((x, y) => {
            if (item.config) {
              x.className = "block " + item.config;
            }
            if (y == unstyledLoops.length - 1) {
              if (item.text) {
                x.appendChild(document.createTextNode(item.text));
              }
            }
          });
          return;
      }
    }

    // Se há texto para ser adicionado antes desse
    // elemento, adicione-o.
    if (textArr && textArr.length > index) {
      parent.appendChild(document.createTextNode(textArr[index]));
    }
    parent.appendChild(node);
  });
}
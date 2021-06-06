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
console.log(toScratchBlocks(test));
scratchblocks.renderMatching('pre.blocks', {
  style:     'scratch2',   // Optional, defaults to 'scratch2'.
  languages: ['en'], // Optional, defaults to ['en'].
});

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
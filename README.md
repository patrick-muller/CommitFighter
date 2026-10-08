# CommitFighter: Eleição da Bolha

Protótipo de jogo de luta 2D, no estilo Street Fighter, ambientado na eleição fictícia da bolha dev. É uma paródia de fã, sem afiliação com ninguém.

## Como abrir

Dê um duplo clique em `index.html`. Funciona no Chrome, Edge, Firefox ou Safari, direto do disco (`file://`), sem build, sem servidor e sem internet. Clique na janela ou aperte qualquer tecla para liberar o som.

## Controles

| | P1 | P2 |
|---|---|---|
| Andar | A / D | ← / → |
| Pular | W | ↑ |
| Soco | F | K |
| Chute | G | L |
| Normal do kit | frente + G | frente + L |
| Especial | H | ; (a tecla Ç no ABNT2) |
| Super (barra cheia) | J | ' (a tecla ~ no ABNT2) |
| Guarda | segurar para trás | segurar para trás |

Menus: setas ou WASD para navegar, Enter para confirmar, Esc para voltar. Na luta, Esc pausa. M liga e desliga o som. No Treino, T alterna o boneco entre parado e bloqueando.

## Modos

Ao abrir, aparece "APERTE ENTER". O Enter toca uma vez o vídeo de abertura (`assets/bolhadev.mp4`); Enter ou Esc pula o vídeo.

- **Arcade**: 3 lutas contra a CPU e depois o chefão Claude. Quem vence o Claude leva a faixa presidencial, e o Claude passa a ficar disponível no Versus e no Treino.
- **Versus**: P2 humano ou P2 CPU, em melhor de 3.
- **Treino**: contra um boneco, com vida infinita e super sempre cheio.

As porcentagens da urna começam no resultado real de eleicaobolhadev.com e mudam ±0,4 por round. Elas ficam salvas no navegador; o menu tem a opção "Zerar porcentagens".

Para desbloquear o chefão sem jogar o Arcade, digite `claude` na tela inicial.

## Arte

As folhas de sprite foram geradas no Grok, com os prompts de `prompts/grok-prompts.md`, e estão em `assets/raw/`. Para trocar ou adicionar uma folha, salve-a como `assets/raw/<id>.jpeg` e rode:

```
python3 tools/cut_sprites.py
```

O script precisa de Pillow, numpy e scipy. Ele gera `assets/sprites/`, `assets/portraits/`, `assets/stage.jpg` e `js/atlas.js`, e grava em `assets/debug/` folhas de conferência com a âncora (os pés) de cada pose.

O que já está no kit de cada lutador aparece no comentário do topo de `index.html`.

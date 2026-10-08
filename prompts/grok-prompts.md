# CommitFighter: prompts para o Grok

## Como usar

1. **Anexe a foto pública da pessoa** (o avatar do X serve) junto com o prompt. Sem referência, o Grok não sabe como essas pessoas são e inventa um rosto.
2. Cole o prompt inteiro. Ele está em inglês porque modelos de imagem seguem melhor as instruções em inglês.
3. Peça **imagem quadrada (1:1)**.
4. Confira o resultado:
   - Tem que ter 16 poses, na ordem pedida.
   - O fundo tem que ser magenta chapado.
   - Todas as poses viradas para a direita, com o mesmo tamanho de personagem.
   Se falhar, gere de novo; costuma levar 2 a 4 tentativas.
5. Se o Grok não conseguir fazer 16 poses numa imagem, use a **versão em 2 folhas** do fim deste arquivo.
6. Salve as imagens como `assets/raw/<id>.png`. Os ids são `deyvin`, `galego`, `raul`, `sam`, `montano`, `sibelius`, `akita`, `vini`, `deschamps` e `claude`.

O fundo é magenta (#FF00FF) porque é a cor que nenhum personagem usa, o que facilita o recorte automático. Pelo mesmo motivo, os prompts proíbem magenta e rosa nas roupas e nos efeitos.

---

## Ordem fixa das 16 poses (igual em todos os prompts)

| # | Pose | # | Pose |
|---|---|---|---|
| 1 | idle A | 9 | chute esticado |
| 2 | idle B (respirando) | 10 | block |
| 3 | andando A | 11 | tomou golpe |
| 4 | andando B | 12 | especial: carga |
| 5 | pulo | 13 | especial: golpe com o prop |
| 6 | soco: preparação | 14 | super |
| 7 | soco esticado | 15 | KO caído |
| 8 | chute: preparação | 16 | vitória |

---

## 1. Mano Deyvin — `deyvin`

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, slightly chibi proportions (big head, about 1/3 of body height), thick dark outlines, clean flat shading, vibrant colors. Affectionate, friendly caricature — never mean.

CHARACTER: "Mano Deyvin", a Brazilian tech streamer, the president of the dev bubble. Face and facial hair based on the attached reference photo. Wears a dark gray beanie, black-framed glasses, a purple hoodie, blue jeans and white sneakers. Always carries a big glass beer mug (golden draft beer with white foam). Confident, charismatic, jokey grappler.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle fighting stance holding the beer mug at chest height
2 idle stance, breathing (shoulders slightly lower)
3 walking forward, step A
4 walking forward, step B
5 jumping, knees tucked
6 punch wind-up, fist pulled back
7 straight punch fully extended
8 kick wind-up, knee raised
9 high front kick fully extended
10 blocking, forearms crossed in front of face
11 hit reaction, recoiling backwards, eyes shut
12 special charge: crouching, beer mug glowing golden
13 special: swinging a GIANT beer mug forward, beer splash
14 super: standing on a small podium, both arms up, confetti and fireworks
15 knocked out, lying on the floor
16 victory: raising the beer mug in a toast, big smile
```

## 2. Augusto Galego — `galego`

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, slightly chibi proportions (big head, about 1/3 of body height), thick dark outlines, clean flat shading, vibrant colors. Affectionate, friendly caricature — never mean.

CHARACTER: "Augusto Galego", a Brazilian digital-nomad dev who teaches online courses. Face and hair based on the attached reference photo. Wears a khaki travel jacket, a huge hiking backpack with patches and a sleeping roll, cargo pants and trail boots. Fast rushdown fighter, energetic.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle bouncing fighting stance
2 idle stance, breathing
3 walking forward, step A
4 walking forward, step B
5 jumping, knees tucked
6 punch wind-up
7 straight punch fully extended
8 kick wind-up, knee raised
9 front kick fully extended
10 blocking, forearms crossed in front of face
11 hit reaction, recoiling backwards
12 special charge: pulling a glowing holographic presentation slide out of the backpack
13 special: thrusting a big blank holographic slide forward like a shield
14 super: dashing forward at high speed, cyan speed lines, banknotes flying away behind him
15 knocked out, lying on the floor, backpack open
16 victory: thumbs up, sitting on the backpack
```

## 3. Raul Sena — `raul`

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, slightly chibi proportions (big head, about 1/3 of body height), thick dark outlines, clean flat shading, vibrant colors. Affectionate, friendly caricature — never mean.

CHARACTER: "Raul Sena", a Brazilian tech-market personality. Face and hair based on the attached reference photo. Wears a navy blazer over a white t-shirt, dark jeans, loafers. A small floating candlestick stock chart hovers near him. Calm zoner fighter, business smile.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle stance, one hand adjusting the blazer
2 idle stance, breathing
3 walking forward, step A
4 walking forward, step B
5 jumping, knees tucked
6 punch wind-up
7 straight punch fully extended
8 kick wind-up, knee raised
9 front kick fully extended
10 blocking, forearms crossed in front of face
11 hit reaction, recoiling backwards
12 special charge: holding an open laptop, glowing inbox icon above it
13 special: a burst of many white envelopes (emails) shooting forward from the laptop
14 super: holding a huge overflowing gauge meter, needle in the red, sparks
15 knocked out, lying on the floor, papers scattered
16 victory: offering a handshake with a business card
```

## 4. Sam Santos — `sam`

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, slightly chibi proportions (big head, about 1/3 of body height), thick dark outlines, clean flat shading, vibrant colors. Affectionate, friendly caricature — never mean.

CHARACTER: "Sam Santos", a Brazilian Node.js engineer. Face and hair based on the attached reference photo. Wears a dark gray hoodie with the hood down and a big yellow circular-arrows logo (event loop) on the chest, black joggers, sneakers. Technical, precise fighter.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle fighting stance
2 idle stance, breathing
3 walking forward, step A
4 walking forward, step B
5 jumping, knees tucked
6 punch wind-up
7 straight punch fully extended
8 kick wind-up, knee raised
9 front kick fully extended
10 blocking, forearms crossed in front of face
11 hit reaction, recoiling backwards
12 special charge: three tiny yellow-and-black robot bees hovering around his hand
13 special: pointing forward, the three robot bees flying forward to sting
14 super: shoving a big server rack forward with both hands, orange sparks
15 knocked out, lying on the floor
16 victory: arms crossed, coffee cup, satisfied smirk
```

## 5. Lucas Montano — `montano`

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, slightly chibi proportions (big head, about 1/3 of body height), thick dark outlines, clean flat shading, vibrant colors. Affectionate, friendly caricature — never mean.

CHARACTER: "Lucas Montano", a Brazilian tech YouTuber, engineer-turned-founder. Face based on the attached reference photo: short dark hair, light stubble beard, NO glasses. Wears a plain solid black t-shirt, jeans, white sneakers. Upright founder posture, closed fists, no big props except a cheap gray entry-level laptop in some poses. Balanced "shoto" fighter, confident and nostalgic.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle fighting stance
2 idle stance, breathing
3 walking forward, step A
4 walking forward, step B
5 jumping, knees tucked
6 punch wind-up, holding a cheap gray laptop in the front hand
7 short straight punch with the cheap gray laptop
8 kick wind-up, knee raised
9 front kick fully extended
10 blocking, forearms crossed in front of face
11 hit reaction, recoiling backwards
12 special charge: arms wide open, calling someone, confident smile
13 special: pointing forward as a line of five tiny chibi interns with laptops runs forward along the floor
14 super: holding an old beige CRT monitor overhead showing a 2014 web forum, retro sepia glow
15 knocked out, lying on the floor
16 victory: hands in pockets, looking into the distance, nostalgic
```

## 6. Sibelius Seraphini — `sibelius`

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, slightly chibi proportions (big head, about 1/3 of body height), thick dark outlines, clean flat shading, vibrant colors. Affectionate, friendly caricature — never mean.

CHARACTER: "Sibelius Seraphini", a Brazilian startup CTO. Face and hair based on the attached reference photo. Wears glasses, a navy startup t-shirt, a CTO badge on a lanyard, chinos, sneakers. Tricky mixup fighter, clever grin.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle fighting stance
2 idle stance, breathing
3 walking forward, step A
4 walking forward, step B
5 jumping, knees tucked
6 punch wind-up
7 straight punch fully extended
8 kick wind-up, knee raised
9 front kick fully extended
10 blocking, forearms crossed in front of face
11 hit reaction, recoiling backwards
12 special charge: pulling out a clipboard, endless paper form starting to unroll
13 special: a gigantic endless paper form unrolling forward like a wave
14 super: holding up a smartphone, gold coins raining from the screen
15 knocked out, lying on the floor, badge flipped
16 victory: pointing at the CTO badge, smug smile
```

## 7. Fabio Akita — `akita`

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, slightly chibi proportions (big head, about 1/3 of body height), thick dark outlines, clean flat shading, vibrant colors. Affectionate, friendly caricature — never mean.

CHARACTER: "Fabio Akita", a veteran Brazilian programmer and tech commentator, the final-act "ranting master". Face, hair and beard based on the attached reference photo. Wears a black t-shirt, dark jeans, boots. A brown-and-white eagle perches on his left shoulder in every pose (except 14, where it flies). Strong, intimidating, but funny.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle stance, arms crossed, eagle on shoulder
2 idle stance, breathing
3 walking forward, step A
4 walking forward, step B
5 jumping, knees tucked
6 punch wind-up
7 straight punch fully extended
8 kick wind-up, knee raised
9 front kick fully extended
10 blocking, palm raised forward like a "stop" gesture, small cyan shield
11 hit reaction, recoiling backwards, eagle flapping
12 special charge: inhaling deeply, chest puffed, looking up
13 special: shouting forward, a big white sound-wave cone blasting from his mouth
14 super: pointing forward while the eagle swoops forward, wings spread, talons out
15 knocked out, lying on the floor, eagle standing on him
16 victory: arms crossed, stern face, eagle screaming
```

## 8. Vini Lana — `vini`

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, slightly chibi proportions (big head, about 1/3 of body height), thick dark outlines, clean flat shading, vibrant colors. Affectionate, friendly caricature — never mean.

CHARACTER: "Vini Lana", a Brazilian dev educator and live-streamer. Face and hair based on the attached reference photo. Wears a gaming headset with microphone, a white t-shirt, jeans, sneakers. Carries a giant white computer mouse-pointer arrow as a weapon (like a staff). Puppet/summoner fighter, teacher energy.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle stance holding the giant cursor arrow
2 idle stance, breathing
3 walking forward, step A
4 walking forward, step B
5 jumping, knees tucked
6 punch wind-up
7 straight punch fully extended
8 kick wind-up, knee raised
9 front kick fully extended
10 blocking with the giant cursor held across the body
11 hit reaction, recoiling backwards, headset askew
12 special charge: raising the cursor, three small chibi students with laptops appearing behind him
13 special: pointing the cursor forward, three small students rushing forward
14 super: arms spread, a burst of chat emotes, hearts and thumbs-up icons flying forward
15 knocked out, lying on the floor
16 victory: pointing at the viewer with the cursor, smiling, talking into the mic
```

## 9. Filipe Deschamps — `deschamps`

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, slightly chibi proportions (big head, about 1/3 of body height), thick dark outlines, clean flat shading, vibrant colors. Affectionate, friendly caricature — never mean.

CHARACTER: "Filipe Deschamps", a Brazilian tech YouTuber and educator. Face and his signature hairstyle based on the attached reference photo. Wears a plain dark t-shirt, jeans, sneakers. A small floating video-thumbnail frame (blank, with a play button) hovers near him. Didactic zoner fighter, enthusiastic.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle fighting stance
2 idle stance, breathing
3 walking forward, step A
4 walking forward, step B
5 jumping, knees tucked
6 punch wind-up
7 straight punch fully extended
8 kick wind-up, knee raised
9 front kick fully extended
10 blocking, forearms crossed in front of face
11 hit reaction, recoiling backwards
12 special charge: excited surprised face, both hands framing an imaginary picture
13 special: thrusting a big blank video thumbnail with a play button forward
14 super: pointing up as a giant rolled newspaper-style newsletter falls from above
15 knocked out, lying on the floor
16 victory: hands open toward the viewer, excited smile
```

## 10. Claude, o chefão — `claude`

Como o Claude não é uma pessoa, não precisa de foto de referência.

```
Sprite sheet for a 2D arcade fighting game, 16-bit SNES pixel art style inspired by Street Fighter II and Pocket Fighter, thick dark outlines, clean flat shading, vibrant colors. This is the FINAL BOSS, like M. Bison: imposing, taller and broader than a regular fighter, but still playful.

CHARACTER: "Claude", an AI assistant turned final boss. Humanoid figure in a long warm terracotta-orange and cream coat with a high collar and a short cape. Instead of a human head, a glowing orange starburst / asterisk-shaped head with a calm, polite face suggestion. A small floating white chat speech bubble hovers beside it, and a thin glowing orange loading-spinner ring floats behind the head like a halo. Elegant, polite, overwhelmingly powerful.

LAYOUT: one square image, a 4x4 grid of 16 poses, same character, same outfit, same scale in every cell, full body never cropped, feet on the same baseline in each cell, ALL poses facing RIGHT. Generous empty space between poses. Background: solid flat pure magenta (#FF00FF), no gradient, no floor, no shadows, no text, no grid lines, no borders. Never use magenta or pink on the character or effects.

POSES, left to right, top to bottom:
1 idle boss stance, hands behind back, cape flowing
2 idle stance, breathing, spinner halo rotated
3 walking forward, step A
4 walking forward, step B
5 jumping, cape billowing
6 punch wind-up
7 straight punch fully extended
8 kick wind-up, knee raised
9 front kick fully extended
10 polite refusal block: open palm forward, glowing orange barrier
11 hit reaction, recoiling backwards, starburst flickering
12 special charge: the chat bubble growing large and glowing
13 special: launching a big glowing chat speech bubble forward as a projectile
14 super: rising orange uppercut, huge spinning loading-spinner ring around the body
15 defeated, kneeling, starburst dimmed, small "…" bubble
16 victory: polite bow, hand on chest, chat bubble with a heart
```

---

## Retratos da tela de seleção (1 por lutador)

Troque `<CHARACTER>` pela linha CHARACTER do prompt do lutador e anexe a mesma foto.

```
Character select portrait for a 2D arcade fighting game, 16-bit SNES pixel art style, slightly chibi, thick dark outlines, vibrant colors. Bust portrait (head and shoulders), 3/4 view facing right, confident expression, affectionate caricature.
<CHARACTER>
Square image, solid flat pure magenta (#FF00FF) background, no text, no borders, no shadows.
```

## Cenário (stage único)

```
Background stage for a 2D arcade fighting game, 16-bit SNES pixel art, wide 16:9, side view, no characters, no text.
A Brazilian tech streamer's live-stream room at night, dark setup with neon purple and neon green lighting. Left: a desk with a big monitor, keyboard and a ring light, two gamer chairs. A red "ON AIR" light sign. A poster on the wall with a big "7x0" scoreboard. Right: a large wall screen (leave it blank, dark) for a live percentage display. Floor: a tatami fighting mat with a subtle glowing green terminal grid. The bottom third of the image is open floor for the fighters. Moody, cozy, nerdy.
```

---

## Versão em 2 folhas (se a de 16 poses falhar)

Use o mesmo prompt do lutador e troque o bloco LAYOUT/POSES:

- **Folha A** (`<id>-a.png`): "a 4x2 grid of 8 poses", com as poses 1 a 8.
- **Folha B** (`<id>-b.png`): "a 4x2 grid of 8 poses", com as poses 9 a 16, renumeradas de 1 a 8.

Anexe também a folha A ao pedir a B e acrescente: "Match exactly the character design, outfit, colors and scale of the attached sprite sheet."

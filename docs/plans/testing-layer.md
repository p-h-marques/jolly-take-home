# Configurar infraestrutura de testes unitários (Jest + jest-expo)

## Contexto

O [roadmap](docs/05_roadmap.md) reserva o passo 6 para testes unitários, focados na lógica de normalização search+status-filter ([04_tech_decisions.md](docs/04_tech_decisions.md)). Essa lógica ainda não existe no código (List/Search/Detail/Favorites — passos 2–5 — não foram implementados; `src/app/(tabs)/index.tsx` é mock). Para não bloquear o trabalho de infraestrutura na implementação das telas, vamos montar o setup de testes agora, validado com um teste simples sobre a única lógica pura já existente: `buildQueryString` em [src/api/client.ts](src/api/client.ts#L15-L26).

Nenhuma dependência ou config de teste existe hoje no projeto: não há `babel.config.js`, `jest-expo` não está instalado, e não há bloco `"jest"` no `package.json`.

## Passos

1. **Instalar dependências de dev**
   `npx expo install --dev jest-expo @types/jest`
   (usa o resolver do `expo install` para pegar versões compatíveis com o SDK 54)

2. **Criar `babel.config.js`** na raiz do projeto:
   ```js
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ["babel-preset-expo"],
     };
   };
   ```
   Necessário porque `jest-expo` roda a transformação via `babel-jest`, fora do Metro — hoje o projeto não precisa desse arquivo porque o Metro aplica o preset padrão internamente.

3. **Configurar o Jest** — adicionar bloco `"jest"` ao [package.json](package.json):
   ```json
   "jest": {
     "preset": "jest-expo",
     "moduleNameMapper": {
       "^@/(.*)$": "<rootDir>/src/$1"
     }
   }
   ```
   O `moduleNameMapper` é necessário porque o Jest não usa o resolver do Metro e não entende o alias `@/*` definido em [tsconfig.json](tsconfig.json#L5-L7).

4. **Adicionar scripts** ao `package.json`:
   ```json
   "test": "jest",
   "test:watch": "jest --watch"
   ```

5. **Exportar `buildQueryString`** em `src/api/client.ts` (remover o `function` sem `export` → `export function`). É a única lógica pura já existente no projeto hoje.

6. **Criar `src/api/client.test.ts`** com casos cobrindo:
   - sem params → retorna string vazia
   - params com valores → gera querystring correta (`?page=1`)
   - params com valor `undefined` → é ignorado na querystring

7. **Rodar `npm test`** para validar que todo o pipeline (Babel + TS + alias + preset) está funcionando, e checar que `npm run lint` (Biome) não acusa nada nos novos arquivos.

## Verificação

- `npm test` passa com os 3 casos do passo 6.
- `npm run lint` limpo.
- `npx tsc --noEmit` (ou equivalente) sem erros novos — confirma que os tipos do Jest (`describe`/`it`/`expect`) estão resolvidos via `@types/jest`.

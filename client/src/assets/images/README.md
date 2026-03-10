# Quantor - Assets de Imagens

## Logos do Sistema

Este diretório contém as logos oficiais do sistema Quantor.

### Arquivos Disponíveis

- **logo-full.svg** - Logo completa com texto "QUANTOR" e subtítulo "GESTÃO INTELIGENTE"
  - Dimensões: 180x40px
  - Uso: Sidebar expandida, headers, documentos
  
- **logo-icon.svg** - Ícone da marca (símbolo Q)
  - Dimensões: 40x40px
  - Uso: Sidebar colapsada, favicon, mobile

### Design

As logos utilizam:
- Gradiente azul (#3B82F6 → #1D4ED8)
- Símbolo "Q" estilizado representando análise e crescimento
- Tipografia Inter (system-ui fallback)
- Design moderno e profissional adequado para sistemas financeiros

### Uso no Código

```tsx
import logoFull from "@/assets/images/logo-full.svg";
import logoIcon from "@/assets/images/logo-icon.svg";

// Logo completa
<img src={logoFull} alt="Quantor - Gestão Inteligente" />

// Ícone
<img src={logoIcon} alt="Quantor" />
```

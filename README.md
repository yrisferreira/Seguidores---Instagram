# Automação Instagram - Deixar de Seguir

Este script Python automatiza o processo de deixar de seguir usuários que não te seguem de volta no Instagram.

## Requisitos

- Python 3.6 ou superior
- Conta no Instagram
- Autenticação em dois fatores desativada temporariamente (se estiver ativa)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/yrisferreira/Seguidores---Instagram.git
cd Seguidores---Instagram
```

2. Crie e ative o ambiente virtual:
```bash
python3 -m venv .venv
source .venv/bin/activate  # No Windows: .venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Como Usar

1. Execute o script:
```bash
python main.py
```

2. Digite seu nome de usuário e senha do Instagram quando solicitado

3. O script vai:
   - Mostrar estatísticas dos seus seguidores
   - Listar quem não te segue de volta
   - Pedir confirmação antes de começar
   - Parar de seguir automaticamente quem não te segue de volta

## Observações

- Use com moderação para evitar bloqueio do Instagram
- Recomenda-se não executar mais de uma vez por dia
- Mantenha a autenticação em dois fatores desativada durante o uso

## Contribuições

Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias!

## Licença

Este projeto está sob a licença MIT. 
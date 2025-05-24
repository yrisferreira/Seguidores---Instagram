# Automação Instagram - Deixar de Seguir

Este script Python automatiza o processo de deixar de seguir usuários que não te seguem de volta no Instagram.

## Requisitos

* Python 3.6 ou superior
* Conta no Instagram
* Autenticação em dois fatores desativada temporariamente (se estiver ativa)

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

2. Na primeira execução:
   - O script abrirá uma nova janela do Chrome
   - Faça login no Instagram
   - Pressione Enter para continuar
   - O script salvará seus cookies para uso futuro

3. Nas próximas execuções:
   - O script usará os cookies salvos
   - Você estará automaticamente logado

4. Digite seu nome de usuário do Instagram quando solicitado

5. O script vai:
   - Mostrar estatísticas dos seus seguidores
   - Listar quem não te segue de volta
   - Salvar a lista em 'nao_seguem_de_volta.txt'

## Observações

* Use com moderação para evitar bloqueio do Instagram
* Recomenda-se não executar mais de uma vez por dia
* Mantenha a autenticação em dois fatores desativada durante o uso
* Os cookies são salvos localmente e não são compartilhados

## Contribuições

Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias!

## Licença

Este projeto está sob a licença MIT. 
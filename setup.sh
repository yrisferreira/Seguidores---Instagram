#!/bin/bash

echo "Instalando ChromeDriver no Mac..."

# Verifica se o Homebrew está instalado
if ! command -v brew &> /dev/null; then
    echo "Instalando Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Instala o ChromeDriver
echo "Instalando ChromeDriver..."
brew install chromedriver

# Dá permissão de execução
echo "Configurando permissões..."
chmod +x /usr/local/bin/chromedriver

echo "ChromeDriver instalado com sucesso!"
echo "Agora você pode executar o script Python." 
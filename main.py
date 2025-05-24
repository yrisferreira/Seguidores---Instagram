from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
import os

def iniciar_chrome():
    """Inicia o Chrome e copia os cookies"""
    print("Iniciando o Chrome...")
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)
    
    # Carrega os cookies do arquivo
    if os.path.exists('cookies.json'):
        print("Carregando cookies salvos...")
        driver.get('https://www.instagram.com')
        with open('cookies.json', 'r') as f:
            cookies = json.load(f)
            for cookie in cookies:
                driver.add_cookie(cookie)
        print("Cookies carregados!")
    else:
        print("Por favor, faça login no Instagram...")
        driver.get('https://www.instagram.com')
        input("Depois de fazer login, pressione Enter para continuar...")
        
        # Salva os cookies
        print("Salvando cookies...")
        cookies = driver.get_cookies()
        with open('cookies.json', 'w') as f:
            json.dump(cookies, f)
        print("Cookies salvos!")
    
    return driver

def obter_listas(driver, username):
    """Obtém as listas de seguidores e seguindo"""
    print(f"Acessando perfil de {username}...")
    driver.get(f'https://www.instagram.com/{username}/')
    time.sleep(5)

    print("Obtendo lista de seguidores...")
    seguidores_link = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//a[contains(@href, '/followers')]"))
    )
    seguidores_link.click()
    time.sleep(3)

    seguidores = set()
    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//div[@role='dialog']"))
    )
    
    print("Coletando seguidores...")
    while True:
        links = modal.find_elements(By.TAG_NAME, "a")
        for link in links:
            if link.get_attribute("href"):
                username = link.get_attribute("href").split("/")[-2]
                if username != "":
                    seguidores.add(username)
        
        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", modal)
        time.sleep(2)
        
        if len(seguidores) >= len(links):
            break

    print(f"Coletados {len(seguidores)} seguidores")
    driver.find_element(By.XPATH, "//button[contains(text(), 'Fechar')]").click()
    time.sleep(3)

    print("Obtendo lista de seguindo...")
    seguindo_link = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//a[contains(@href, '/following')]"))
    )
    seguindo_link.click()
    time.sleep(3)

    seguindo = set()
    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//div[@role='dialog']"))
    )
    
    print("Coletando seguindo...")
    while True:
        links = modal.find_elements(By.TAG_NAME, "a")
        for link in links:
            if link.get_attribute("href"):
                username = link.get_attribute("href").split("/")[-2]
                if username != "":
                    seguindo.add(username)
        
        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", modal)
        time.sleep(2)
        
        if len(seguindo) >= len(links):
            break

    print(f"Coletados {len(seguindo)} seguindo")
    return seguidores, seguindo

def main():
    print("Iniciando o script...")
    driver = iniciar_chrome()
    
    try:
        username = input("Digite seu nome de usuário do Instagram: ")
        seguidores, seguindo = obter_listas(driver, username)
        
        nao_seguem_de_volta = seguindo - seguidores
        
        print(f"\nVocê está seguindo {len(seguindo)} pessoas")
        print(f"Você tem {len(seguidores)} seguidores")
        print(f"Encontrados {len(nao_seguem_de_volta)} usuários que não te seguem de volta")
        
        with open('nao_seguem_de_volta.txt', 'w') as f:
            for user in nao_seguem_de_volta:
                f.write(f"{user}\n")
        
        print("\nLista salva em 'nao_seguem_de_volta.txt'")
        
    except Exception as e:
        print(f"Erro: {str(e)}")
    
    finally:
        input("\nPressione Enter para encerrar...")
        driver.quit()

if __name__ == "__main__":
    main()

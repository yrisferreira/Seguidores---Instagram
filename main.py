from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException, ElementClickInterceptedException
import time
import random

def iniciar_chrome():
    """Usa o Chrome que já está aberto"""
    print("Conectando ao Chrome existente...")
    options = webdriver.ChromeOptions()
    options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    driver = webdriver.Chrome(options=options)
    print("Conectado ao Chrome!")
    return driver

def esperar_elemento(driver, seletores, timeout=10):
    """Espera um elemento aparecer na página usando múltiplos seletores"""
    for seletor in seletores:
        try:
            elemento = WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located(seletor)
            )
            return elemento
        except TimeoutException:
            continue
    return None

def fechar_popups(driver):
    """Tenta fechar pop-ups comuns do Instagram"""
    popup_selectors = [
        (By.XPATH, "//button[contains(text(), 'Agora não')]"),
        (By.XPATH, "//button[contains(text(), 'Not Now')]"),
        (By.XPATH, "//button[contains(text(), 'Depois')]"),
        (By.XPATH, "//button[contains(text(), 'Later')]"),
        (By.XPATH, "//button[contains(text(), 'Fechar')]"),
        (By.XPATH, "//button[contains(text(), 'Close')]"),
        (By.XPATH, "//div[@role='dialog']//button[1]"),
    ]
    
    for by, value in popup_selectors:
        try:
            botao = driver.find_element(by, value)
            botao.click()
            time.sleep(1)
        except:
            continue

def coletar_usuarios(driver, modal, tipo):
    """Coleta usuários do modal de seguidores ou seguindo"""
    usuarios = set()
    ultimo_tamanho = 0
    tentativas_sem_mudanca = 0
    max_tentativas = 5
    
    print(f"Coletando {tipo}...")
    
    while tentativas_sem_mudanca < max_tentativas:
        try:
            # Espera os links aparecerem
            time.sleep(random.uniform(2, 3))
            
            # Tenta diferentes seletores para os links
            seletores = [
                (By.CSS_SELECTOR, "div[role='dialog'] a[role='link']"),
                (By.CSS_SELECTOR, "div[role='dialog'] a"),
                (By.XPATH, "//div[@role='dialog']//a"),
                (By.XPATH, "//div[@role='dialog']//a[contains(@href, '/')]")
            ]
            
            links = []
            for by, value in seletores:
                try:
                    links = modal.find_elements(by, value)
                    if links:
                        break
                except:
                    continue
            
            # Coleta os usuários
            for link in links:
                try:
                    href = link.get_attribute("href")
                    if href and "/" in href:
                        username = href.split("/")[-2]
                        if username and username not in usuarios:
                            usuarios.add(username)
                except StaleElementReferenceException:
                    continue
            
            # Verifica se encontrou novos usuários
            if len(usuarios) == ultimo_tamanho:
                tentativas_sem_mudanca += 1
                print(f"Nenhum novo {tipo} encontrado. Tentativa {tentativas_sem_mudanca}/{max_tentativas}")
            else:
                tentativas_sem_mudanca = 0
                ultimo_tamanho = len(usuarios)
                print(f"Coletados {len(usuarios)} {tipo} até agora...")
            
            # Rola a página com velocidade variável
            scroll_amount = random.randint(300, 500)
            driver.execute_script(f"arguments[0].scrollTop += {scroll_amount}", modal)
            time.sleep(random.uniform(2, 3))
            
        except Exception as e:
            print(f"Erro ao coletar {tipo}: {str(e)}")
            time.sleep(2)
            continue
    
    print(f"Coletados {len(usuarios)} {tipo} no total")
    return usuarios

def obter_listas(driver, username):
    """Obtém as listas de seguidores e seguindo"""
    print(f"Acessando perfil de {username}...")
    driver.get(f'https://www.instagram.com/{username}/')
    time.sleep(5)
    
    # Tenta fechar pop-ups iniciais
    fechar_popups(driver)

    # Obtém seguidores
    print("Abrindo lista de seguidores...")
    seguidores_selectors = [
        (By.XPATH, "//a[contains(@href, '/followers')]"),
        (By.XPATH, "//a[contains(@href, '/followers/')]"),
        (By.XPATH, "//a[contains(@href, '/seguidores')]"),
        (By.XPATH, "//a[contains(@href, '/seguidores/')]")
    ]
    
    seguidores_link = esperar_elemento(driver, seguidores_selectors)
    if not seguidores_link:
        raise Exception("Não foi possível encontrar o link de seguidores")
    
    try:
        seguidores_link.click()
    except ElementClickInterceptedException:
        # Se o clique foi interceptado, tenta fechar pop-ups e clicar novamente
        fechar_popups(driver)
        time.sleep(2)
        seguidores_link.click()
    
    time.sleep(3)

    modal = esperar_elemento(driver, [(By.XPATH, "//div[@role='dialog']")])
    if not modal:
        raise Exception("Não foi possível abrir o modal de seguidores")
    
    seguidores = coletar_usuarios(driver, modal, "seguidores")
    
    # Fecha o modal
    fechar_btn = esperar_elemento(driver, [
        (By.XPATH, "//button[contains(text(), 'Fechar')]"),
        (By.XPATH, "//button[contains(text(), 'Close')]"),
        (By.XPATH, "//div[@role='dialog']//button[1]")
    ])
    if fechar_btn:
        fechar_btn.click()
    time.sleep(3)

    # Obtém seguindo
    print("Abrindo lista de seguindo...")
    seguindo_selectors = [
        (By.XPATH, "//a[contains(@href, '/following')]"),
        (By.XPATH, "//a[contains(@href, '/following/')]"),
        (By.XPATH, "//a[contains(@href, '/seguindo')]"),
        (By.XPATH, "//a[contains(@href, '/seguindo/')]")
    ]
    
    seguindo_link = esperar_elemento(driver, seguindo_selectors)
    if not seguindo_link:
        raise Exception("Não foi possível encontrar o link de seguindo")
    
    try:
        seguindo_link.click()
    except ElementClickInterceptedException:
        fechar_popups(driver)
        time.sleep(2)
        seguindo_link.click()
    
    time.sleep(3)

    modal = esperar_elemento(driver, [(By.XPATH, "//div[@role='dialog']")])
    if not modal:
        raise Exception("Não foi possível abrir o modal de seguindo")
    
    seguindo = coletar_usuarios(driver, modal, "seguindo")
    
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

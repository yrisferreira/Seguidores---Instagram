import instaloader
import time
import os

def limpar_arquivos_antigos():
    # Remove arquivos de cookie antigos
    cookie_del = "config/*cookie.json"
    if os.path.exists(cookie_del):
        os.remove(cookie_del)

def unfollow_non_followers():
    # Limpa arquivos antigos
    limpar_arquivos_antigos()
    
    # Inicializa o loader
    L = instaloader.Instaloader()
    
    # Faz login no Instagram
    username = input("Digite seu nome de usuário do Instagram: ")
    password = input("Digite sua senha do Instagram: ")
    
    try:
        L.login(username, password)
        print("Login realizado com sucesso!")
        
        # Obtém o perfil do usuário
        profile = instaloader.Profile.from_username(L.context, username)
        
        # Obtém lista de seguidores e seguindo
        print("Obtendo lista de seguidores...")
        seguidores = set(follower.username for follower in profile.get_followers())
        
        print("Obtendo lista de seguindo...")
        seguindo = set(followee.username for followee in profile.get_followees())
        
        # Encontra quem não te segue de volta
        nao_seguem_de_volta = seguindo - seguidores
        
        print(f"\nEstatísticas:")
        print(f"Você está seguindo {len(seguindo)} pessoas")
        print(f"Você tem {len(seguidores)} seguidores")
        print(f"Encontrados {len(nao_seguem_de_volta)} usuários que não te seguem de volta")
        
        # Confirmação antes de começar
        confirmacao = input("\nDeseja parar de seguir essas pessoas? (s/n): ")
        
        if confirmacao.lower() == 's':
            for username in nao_seguem_de_volta:
                try:
                    profile = instaloader.Profile.from_username(L.context, username)
                    L.unfollow(profile)
                    print(f"Parou de seguir o usuário {username}")
                    # Espera um pouco para evitar bloqueio do Instagram
                    time.sleep(30)
                except Exception as e:
                    print(f"Erro ao parar de seguir {username}: {str(e)}")
                    time.sleep(60)
        
        print("\nProcesso finalizado!")
        
    except Exception as e:
        print(f"Erro durante o processo: {str(e)}")

if __name__ == "__main__":
    unfollow_non_followers()

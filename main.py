from instagrapi import Client
import time

def unfollow_non_followers():
    # Inicializa o cliente com configurações mais permissivas
    cl = Client()
    cl.delay_range = [1, 3]  # Reduz o delay entre ações
    cl.request_timeout = 15  # Aumenta o timeout das requisições
    
    # Faz login no Instagram
    username = input("Digite seu nome de usuário do Instagram: ")
    password = input("Digite sua senha do Instagram: ")
    
    try:
        # Tenta fazer login com configurações mais permissivas
        cl.login(username, password, verification_code=None)
        print("Login realizado com sucesso!")
        
        # Obtém seu ID de usuário
        user_id = cl.user_id_from_username(username)
        
        # Obtém lista de seguidores e seguindo
        print("Obtendo lista de seguidores...")
        seguidores = set(cl.user_followers(user_id).keys())
        print("Obtendo lista de seguindo...")
        seguindo = set(cl.user_following(user_id).keys())
        
        # Encontra quem não te segue de volta
        nao_seguem_de_volta = seguindo - seguidores
        
        print(f"\nEstatísticas:")
        print(f"Você está seguindo {len(seguindo)} pessoas")
        print(f"Você tem {len(seguidores)} seguidores")
        print(f"Encontrados {len(nao_seguem_de_volta)} usuários que não te seguem de volta")
        
        # Confirmação antes de começar
        confirmacao = input("\nDeseja parar de seguir essas pessoas? (s/n): ")
        
        if confirmacao.lower() == 's':
            for user_id in nao_seguem_de_volta:
                try:
                    username = cl.username_from_user_id(user_id)
                    cl.user_unfollow(user_id)
                    print(f"Parou de seguir o usuário @{username}")
                    # Espera um pouco para evitar bloqueio do Instagram
                    time.sleep(15)  # Reduzido para 15 segundos
                except Exception as e:
                    print(f"Erro ao parar de seguir {user_id}: {str(e)}")
                    time.sleep(30)  # Reduzido para 30 segundos
        
        print("\nProcesso finalizado!")
        
    except Exception as e:
        print(f"Erro durante o processo: {str(e)}")
        if "Two-factor authentication required" in str(e):
            print("\nDica: Tente desativar temporariamente a autenticação em dois fatores no Instagram:")
            print("1. Acesse instagram.com")
            print("2. Vá em Configurações > Segurança")
            print("3. Desative temporariamente a autenticação em dois fatores")
            print("4. Tente rodar o script novamente")
    finally:
        try:
            cl.logout()
        except:
            pass

if __name__ == "__main__":
    unfollow_non_followers()

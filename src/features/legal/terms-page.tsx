import { Link } from "react-router-dom"

import {
  LegalLayout,
  LegalNote,
  LegalSection,
} from "@/features/legal/legal-layout"

const CONTRATADA = {
  razaoSocial: "[RAZÃO SOCIAL DA EMPRESA]",
  cnpj: "[CNPJ]",
  contato: "contato@aprovai.com.br",
}

export function TermsPage() {
  return (
    <LegalLayout
      title="Termos de Uso"
      updatedAt="8 de setembro de 2026"
      summary="Estas são as regras de uso do AprovAI. Ao criar uma conta você concorda com elas. Escrevemos em português direto de propósito: se algo aqui não estiver claro, fale com a gente antes de aceitar."
    >
      <LegalNote>
        Antes de publicar: preencha a razão social, o CNPJ e o e-mail de contato
        na constante <code>CONTRATADA</code> deste arquivo, defina as condições
        comerciais da seção 5 e submeta o texto à revisão jurídica.
      </LegalNote>

      <LegalSection id="quem" title="1. Quem somos e o que é o AprovAI">
        <p>
          O AprovAI é um sistema de gestão de compras e aprovações oferecido na
          modalidade software como serviço por {CONTRATADA.razaoSocial}, CNPJ{" "}
          {CONTRATADA.cnpj}.
        </p>
        <p>
          O sistema centraliza pedidos de compra, calcula a rota de aprovação a
          partir da matriz de alçadas que a sua empresa configura, controla
          orçamento por centro de custo e acompanha o fluxo até o contas a
          pagar.
        </p>
      </LegalSection>

      <LegalSection id="conta" title="2. Conta e responsabilidade">
        <p>
          Para usar o AprovAI é preciso criar uma conta com dados verdadeiros e
          um e-mail válido, que confirmamos antes de liberar as funções
          operacionais.
        </p>
        <p>
          Quem cria a conta e cadastra a organização torna-se administrador
          financeiro dela, e passa a poder convidar outras pessoas e definir os
          papéis de cada uma.
        </p>
        <p>
          Você é responsável por manter a sua senha em segredo e por tudo que
          acontecer na sua conta. Se desconfiar de acesso indevido, troque a
          senha e avise a gente.
        </p>
      </LegalSection>

      <LegalSection id="uso" title="3. O que você não pode fazer">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>Usar o sistema para qualquer finalidade ilícita.</li>
          <li>
            Tentar acessar dados de outra organização, burlar limites de plano
            ou explorar falhas de segurança.
          </li>
          <li>
            Enviar arquivos com código malicioso ou conteúdo que você não tem
            direito de compartilhar.
          </li>
          <li>
            Automatizar acesso de forma a degradar o serviço para outros
            clientes.
          </li>
          <li>Revender ou sublicenciar o acesso sem autorização escrita.</li>
        </ul>
        <p>
          Encontrou uma falha de segurança? Escreva para {CONTRATADA.contato}{" "}
          antes de divulgar. Nós agradecemos e respondemos.
        </p>
      </LegalSection>

      <LegalSection id="dados" title="4. Os dados da sua empresa são seus">
        <p>
          Tudo que a sua empresa insere no AprovAI continua pertencendo a ela.
          Não usamos esses dados para outra finalidade que não seja prestar o
          serviço, e não os vendemos.
        </p>
        <p>
          A exportação dos seus dados fica disponível a qualquer momento,
          inclusive se a assinatura estiver inativa. Consultar o histórico e
          exportar continuam liberados mesmo sem plano ativo; criar e aprovar
          pedidos, não.
        </p>
        <p>
          O tratamento de dados pessoais está descrito na{" "}
          <Link
            to="/privacidade"
            className="font-medium text-primary underline underline-offset-4"
          >
            Política de Privacidade
          </Link>
          , que faz parte destes termos.
        </p>
      </LegalSection>

      <LegalSection id="planos" title="5. Planos, cobrança e cancelamento">
        <p>
          Cada organização tem no máximo uma assinatura ativa por vez, com
          limites de membros, de pedidos por mês e de armazenamento conforme o
          plano contratado. Ao atingir um limite, a ação é bloqueada e o sistema
          indica o upgrade.
        </p>
        <p>
          A troca de plano encerra a assinatura anterior e inicia uma nova. O
          cancelamento pode ser pedido a qualquer momento e vale ao fim do
          período já pago, sem multa.
        </p>
        <LegalNote>
          Preço, periodicidade, prazo de pagamento e política de reembolso
          precisam ser definidos comercialmente e escritos aqui antes da
          publicação.
        </LegalNote>
      </LegalSection>

      <LegalSection id="disponibilidade" title="6. Disponibilidade">
        <p>
          Trabalhamos com uma meta de disponibilidade de 99,5% em horário
          comercial. Manutenções programadas são avisadas com antecedência.
        </p>
        <p>
          Alguns recursos dependem de serviços de terceiros, como a consulta
          pública de CNPJ e a leitura assistida por IA. Se um deles ficar
          indisponível, o sistema continua funcionando: a consulta vira
          preenchimento manual, e a extração cai para o formulário comum.
        </p>
      </LegalSection>

      <LegalSection id="ia" title="7. Sobre a inteligência artificial">
        <p>
          A leitura automática de documentos é um apoio, não uma decisão. Ela
          apenas sugere valores em campos que continuam editáveis, e nada é
          submetido sem uma pessoa confirmar.
        </p>
        <p>
          A rota de aprovação é calculada por algoritmo determinístico a partir
          das regras que a sua empresa configurou. Você pode auditar por que um
          pedido seguiu determinado caminho, e o simulador mostra o resultado
          antes de você salvar uma mudança na matriz.
        </p>
        <p>
          Conferir os valores sugeridos antes de submeter é responsabilidade de
          quem cria o pedido.
        </p>
      </LegalSection>

      <LegalSection id="limites" title="8. Limites de responsabilidade">
        <p>
          O AprovAI organiza e registra decisões de compra, mas quem decide é a
          sua equipe. Não respondemos por decisões comerciais tomadas pelos
          usuários, nem por dados incorretos inseridos por eles.
        </p>
        <p>
          Nossa responsabilidade em qualquer hipótese fica limitada ao valor
          pago pela sua organização nos 12 meses anteriores ao evento.
        </p>
        <p>
          Nada aqui afasta direitos garantidos pelo Código de Defesa do
          Consumidor quando ele for aplicável.
        </p>
      </LegalSection>

      <LegalSection id="encerramento" title="9. Encerramento">
        <p>
          Você pode encerrar a sua conta quando quiser, pela tela de Perfil.
          Podemos suspender ou encerrar o acesso em caso de violação destes
          termos, de uso que ameace a segurança de outros clientes ou de
          inadimplência, sempre com aviso prévio quando for possível.
        </p>
        <p>
          Após o encerramento, mantemos o histórico pelo prazo legal de guarda e
          você continua podendo exportá-lo.
        </p>
      </LegalSection>

      <LegalSection id="mudancas" title="10. Mudanças nestes termos">
        <p>
          Se mudarmos algo relevante, avisamos por e-mail e dentro do sistema
          com antecedência. Continuar usando o AprovAI depois da mudança
          significa aceitar a nova versão.
        </p>
      </LegalSection>

      <LegalSection id="foro" title="11. Lei aplicável">
        <p>
          Estes termos são regidos pela lei brasileira. Fica eleito o foro da
          comarca da sede da contratada para resolver o que não se resolver por
          conversa.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}

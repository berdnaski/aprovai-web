import {
  LegalLayout,
  LegalNote,
  LegalSection,
  LegalTable,
} from "@/features/legal/legal-layout"

const CONTROLADOR = {
  razaoSocial: "[RAZÃO SOCIAL DA EMPRESA]",
  cnpj: "[CNPJ]",
  endereco: "[ENDEREÇO COMPLETO]",
  encarregado: "[NOME DO ENCARREGADO]",
  contato: "privacidade@aprovai.com.br",
}

const TRATAMENTOS = [
  [
    "Cadastro e acesso",
    "Nome, e-mail, telefone, senha (armazenada como hash), data do aceite dos termos",
    "Execução do contrato (art. 7º, V)",
    "Enquanto a conta existir",
  ],
  [
    "Operação de compras",
    "Pedidos criados, decisões de aprovação, justificativas, centro de custo, valores",
    "Execução do contrato (art. 7º, V)",
    "5 anos após o encerramento, por guarda fiscal",
  ],
  [
    "Trilha de auditoria",
    "Autor da ação, tipo de evento, endereço IP, data e hora",
    "Cumprimento de obrigação legal e exercício regular de direitos (art. 7º, II e VI)",
    "5 anos, em registro imutável",
  ],
  [
    "Comunicações do sistema",
    "E-mail, preferências de notificação",
    "Execução do contrato (art. 7º, V)",
    "Enquanto a conta existir",
  ],
  [
    "Lista de espera",
    "E-mail e, se você informar, nome e empresa",
    "Legítimo interesse em contato comercial (art. 7º, IX)",
    "Até a abertura do acesso ou até você pedir a remoção",
  ],
  [
    "Suporte e feedback",
    "Mensagem enviada, rota da tela, captura de tela se você anexar",
    "Legítimo interesse em melhorar o serviço (art. 7º, IX)",
    "2 anos",
  ],
]

const OPERADORES = [
  [
    "DeepSeek",
    "China",
    "Leitura assistida por IA do anexo enviado no pedido",
    "Recurso opcional por plano. O texto do documento é enviado para extração de campos.",
  ],
  [
    "Cloudflare R2",
    "Conforme região contratada",
    "Armazenamento de anexos, avatares e comprovantes",
    "Arquivos ficam criptografados em trânsito.",
  ],
  [
    "Resend",
    "Estados Unidos",
    "Envio de e-mails transacionais e de aprovação",
    "Recebe nome e e-mail do destinatário.",
  ],
  [
    "BrasilAPI",
    "Brasil",
    "Consulta pública de CNPJ de fornecedores",
    "Recebe apenas o número do CNPJ consultado.",
  ],
]

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      updatedAt="8 de setembro de 2026"
      summary="Esta política explica quais dados pessoais o AprovAI trata, por quê, com quem eles são compartilhados e como você exerce os seus direitos. Ela vale para quem usa o sistema e para quem entra na lista de espera pelo nosso site."
    >
      <LegalNote>
        Antes de publicar: preencha a razão social, o CNPJ, o endereço e o nome
        do encarregado na constante <code>CONTROLADOR</code> deste arquivo, e
        submeta o texto à revisão jurídica. Os demais dados descritos aqui foram
        levantados diretamente do código do sistema.
      </LegalNote>

      <LegalSection id="controlador" title="1. Quem é o controlador">
        <p>
          O controlador dos dados pessoais tratados no AprovAI é{" "}
          {CONTROLADOR.razaoSocial}, inscrita no CNPJ {CONTROLADOR.cnpj}, com
          sede em {CONTROLADOR.endereco}.
        </p>
        <p>
          O encarregado pelo tratamento de dados pessoais, previsto no art. 41
          da LGPD, é {CONTROLADOR.encarregado}. Você fala com ele pelo e-mail{" "}
          <strong>{CONTROLADOR.contato}</strong>.
        </p>
        <p>
          Quando a sua empresa contrata o AprovAI, ela é a controladora dos
          dados de compras que insere no sistema, e nós atuamos como operadores
          desses dados. Para os dados da sua conta de acesso e para a lista de
          espera, o controlador somos nós.
        </p>
      </LegalSection>

      <LegalSection id="dados" title="2. Que dados tratamos e por quê">
        <p>
          Não coletamos dados sensíveis, não fazemos perfilamento e não vendemos
          dados para ninguém.
        </p>
        <LegalTable
          head={["Finalidade", "Dados", "Base legal", "Retenção"]}
          rows={TRATAMENTOS}
        />
      </LegalSection>

      <LegalSection id="ia" title="3. Uso de inteligência artificial">
        <p>
          Quando você anexa uma proposta a um pedido e pede a leitura
          automática, o texto do documento é enviado a um provedor de IA para
          extrair fornecedor, valor, categoria e condição de pagamento.
        </p>
        <p>
          <strong>
            A IA nunca decide nada sozinha no AprovAI.
          </strong>{" "}
          Ela apenas preenche campos que continuam editáveis, e nada é enviado
          adiante sem uma pessoa confirmar. A rota de aprovação de um pedido é
          calculada por algoritmo determinístico, a partir da matriz de alçadas
          que a sua empresa configurou, e não por inferência de modelo.
        </p>
        <p>
          O recurso é liberado por plano e pode ser desativado. Se a sua empresa
          não quiser que documentos saiam do país, é possível operar sem ele:
          basta preencher os campos manualmente.
        </p>
      </LegalSection>

      <LegalSection id="compartilhamento" title="4. Com quem compartilhamos">
        <p>
          Usamos os operadores abaixo para prestar o serviço. Cada um recebe
          apenas o necessário para a sua função.
        </p>
        <LegalTable
          head={["Operador", "País", "Para quê", "Observação"]}
          rows={OPERADORES}
        />
        <p>
          <strong>Transferência internacional.</strong> Os operadores acima
          sediados fora do Brasil recebem dados pessoais em país que não possui
          decisão de adequação da ANPD. Essa transferência se apoia em cláusulas
          contratuais específicas firmadas com cada operador, nos termos do art.
          33, II, da LGPD. Você pode pedir uma cópia dessas cláusulas ao
          encarregado.
        </p>
        <p>
          Também podemos compartilhar dados quando houver ordem judicial,
          requisição de autoridade competente ou necessidade de defesa em
          processo.
        </p>
      </LegalSection>

      <LegalSection id="direitos" title="5. Os seus direitos">
        <p>
          O art. 18 da LGPD garante a você um conjunto de direitos, e alguns
          deles você exerce sozinho, direto no sistema:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong>Acesso e portabilidade.</strong> Em Perfil, use “Baixar meus
            dados” para receber um arquivo estruturado com tudo que temos sobre
            você.
          </li>
          <li>
            <strong>Correção.</strong> Nome e telefone você edita na tela de
            Perfil. Para corrigir o e-mail, fale com o administrador da sua
            empresa.
          </li>
          <li>
            <strong>Eliminação.</strong> Em Perfil, “Excluir minha conta”
            anonimiza os seus dados pessoais imediatamente.
          </li>
          <li>
            <strong>Confirmação, informação sobre compartilhamento, revogação
            de consentimento e revisão de decisões.</strong> Peça ao encarregado
            pelo e-mail acima. Respondemos em até 15 dias.
          </li>
        </ul>
        <p>
          Você também pode reclamar diretamente à Autoridade Nacional de
          Proteção de Dados.
        </p>
      </LegalSection>

      <LegalSection id="exclusao" title="6. O que acontece quando você exclui a conta">
        <p>
          A exclusão anonimiza o seu nome, e-mail, telefone e senha, remove os
          seus arquivos do armazenamento e encerra as suas sessões ativas, tudo
          na mesma operação.
        </p>
        <p>
          O que permanece, de forma pseudonimizada, são os registros financeiros
          e a trilha de auditoria dos pedidos que passaram por você. Isso é
          exigido pela obrigação legal de guarda fiscal e pelo art. 16, I e II,
          da LGPD: sem esses registros, a empresa perderia a rastreabilidade de
          decisões de compra já realizadas. Eles não permitem mais identificar
          você diretamente.
        </p>
        <p>
          Se você for o último administrador financeiro da empresa, a exclusão é
          bloqueada até que outra pessoa assuma o papel, para não deixar a
          organização sem responsável.
        </p>
      </LegalSection>

      <LegalSection id="seguranca" title="7. Como protegemos">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>Tráfego sempre por HTTPS com TLS.</li>
          <li>
            Senhas guardadas apenas como hash irreversível, nunca em texto
            plano.
          </li>
          <li>
            Sessão em cookie <code>HttpOnly</code>, <code>Secure</code> e{" "}
            <code>SameSite</code>, com token de curta duração e renovação
            rotacionada.
          </li>
          <li>
            Separação lógica estrita entre empresas: toda consulta ao banco
            filtra pela organização ativa.
          </li>
          <li>
            Autorização verificada no servidor a cada requisição, nunca apenas
            escondendo botões na tela.
          </li>
          <li>Backup diário com retenção de 30 dias.</li>
          <li>Trilha de auditoria imutável, sem rota de alteração ou remoção.</li>
        </ul>
        <p>
          Em caso de incidente de segurança com risco relevante, comunicamos a
          ANPD e os titulares afetados, conforme o art. 48 da LGPD.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="8. Cookies">
        <p>
          Usamos apenas cookies estritamente necessários: os que mantêm a sua
          sessão autenticada. Eles não servem para publicidade nem para
          rastrear você em outros sites, e por isso não dependem de
          consentimento. Não usamos cookies de terceiros para propaganda.
        </p>
      </LegalSection>

      <LegalSection id="alteracoes" title="9. Mudanças nesta política">
        <p>
          Se mudarmos algo relevante, avisamos por e-mail e dentro do sistema
          antes de a mudança valer. A data de atualização no topo desta página
          indica a versão vigente.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}

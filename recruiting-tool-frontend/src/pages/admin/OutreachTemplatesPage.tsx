import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ReplyIcon from "@mui/icons-material/Reply";
import SearchIcon from "@mui/icons-material/Search";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import {
  useOutreachTemplateOverrides,
  useUpsertOutreachTemplateOverride,
  useDeleteOutreachTemplateOverride,
} from "../../api/adminOutreachTemplates";
import {
  useEmailTemplates,
  useUpdateEmailTemplate,
} from "../../hooks/api/useEmailTemplates";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { EmailTemplateType } from "../../types/emailTemplate.types";

interface TemplateVariant {
  label: string;
  subject?: string;
  body: string;
}

interface Template {
  id: number;
  channel: "linkedin" | "email" | "whatsapp" | "response" | "directory";
  titleKey: string;
  hintKey: string;
  es: TemplateVariant[];
  en: TemplateVariant[];
}

const VARIABLES = [
  { key: "NOMBRE", defaultVal: "" },
  { key: "EMPRESA", defaultVal: "" },
  { key: "CARGO", defaultVal: "" },
  { key: "CIUDAD", defaultVal: "" },
  { key: "N_POSICIONES", defaultVal: "" },
  { key: "CANAL", defaultVal: "" },
  { key: "TU_NOMBRE", defaultVal: "" },
  { key: "DESCUENTO", defaultVal: "20" },
];

const TEMPLATES: Template[] = [
  {
    id: 1,
    channel: "linkedin",
    titleKey: "outreach.t1_title",
    hintKey: "outreach.t1_hint",
    es: [
      {
        label: "Variante A — Staff augmentation",
        body: "Hola {{NOMBRE}}, vi que {{EMPRESA}} trabaja en staff augmentation. Estoy construyendo un ATS diseñado específicamente para empresas de staffing y me gustaría conectar. Tenemos un programa para empresas fundadoras con descuento permanente. ¿Te parece si charlamos?",
      },
      {
        label: "Variante B — Agencia de reclutamiento",
        body: "Hola {{NOMBRE}}, encontré {{EMPRESA}} en {{CANAL}} y me llamó la atención su enfoque. Estoy lanzando Borderless ATS, pensado para agencias de reclutamiento, con IA para screening y un programa fundador con precio bloqueado para siempre. ¿Conectamos?",
      },
    ],
    en: [
      {
        label: "Variant A — Staff augmentation",
        body: "Hi {{NOMBRE}}, I saw that {{EMPRESA}} works in staff augmentation. I'm building an ATS designed specifically for staffing firms and would love to connect. We have a Founding Companies Program with a permanent discount. Would you be open to a quick chat?",
      },
      {
        label: "Variant B — Recruiting agency",
        body: "Hi {{NOMBRE}}, I came across {{EMPRESA}} on {{CANAL}} and was impressed by your focus. I'm launching Borderless ATS — built for recruiting agencies — with AI screening and a founder pricing program locked in forever. Want to connect?",
      },
    ],
  },
  {
    id: 2,
    channel: "linkedin",
    titleKey: "outreach.t2_title",
    hintKey: "outreach.t2_hint",
    es: [
      {
        label: "Español",
        body: `Hola {{NOMBRE}}, gracias por conectar.

Te escribo porque estamos abriendo Borderless ATS a un grupo limitado de empresas fundadoras. Es una plataforma ATS con IA para screening de candidatos, programación de entrevistas y gestión de pipelines — pensada para empresas como {{EMPRESA}} que manejan múltiples posiciones a la vez.

El programa fundador incluye:
✅ Descuento permanente ({{DESCUENTO}}% para siempre, sin excepciones)
✅ Acceso directo al equipo de producto para moldear el roadmap
✅ 30 días de prueba gratis sin tarjeta de crédito

¿Tendrías 20 minutos esta semana para que te muestre la plataforma?`,
      },
    ],
    en: [
      {
        label: "English",
        body: `Hi {{NOMBRE}}, thanks for connecting.

I'm reaching out because we're opening Borderless ATS to a limited group of founding companies. It's an AI-powered ATS with candidate screening, interview scheduling, and pipeline management — built for companies like {{EMPRESA}} that manage multiple open positions at once.

The founding program includes:
✅ Permanent discount ({{DESCUENTO}}% forever, no exceptions)
✅ Direct line to the product team to shape the roadmap
✅ 30-day free trial, no credit card required

Would you have 20 minutes this week for a quick demo?`,
      },
    ],
  },
  {
    id: 3,
    channel: "email",
    titleKey: "outreach.t3_title",
    hintKey: "outreach.t3_hint",
    es: [
      {
        label: "Español",
        subject:
          "{{EMPRESA}}: ATS diseñado para staffing (programa fundador abierto)",
        body: `Hola {{NOMBRE}},

Encontré {{EMPRESA}} en {{CANAL}} y quería escribirte directamente.

La mayoría de los ATS del mercado están diseñados para empresas que contratan para sí mismas. Borderless ATS está pensado para empresas de staffing y staff augmentation que gestionan múltiples posiciones para distintos clientes al mismo tiempo.

Lo que resolvemos:
→ Screening automático con IA para manejar alto volumen de candidatos
→ Pipelines personalizables por posición/cliente
→ Programación de entrevistas con integración de calendario
→ Panel de analytics para tomar decisiones en base a datos

Estamos en fase de lanzamiento y tenemos un programa para empresas fundadoras: {{DESCUENTO}}% de descuento permanente sobre el precio final, a cambio de feedback mensual honesto.

¿Te interesa ver una demo de 20 minutos? Puedo adaptarme a tu horario.

Saludos,
{{TU_NOMBRE}}
Borderless ATS — borderlessats.com`,
      },
    ],
    en: [
      {
        label: "English",
        subject:
          "{{EMPRESA}}: ATS built for staffing firms (founding program open)",
        body: `Hi {{NOMBRE}},

I came across {{EMPRESA}} on {{CANAL}} and wanted to reach out directly.

Most ATS tools on the market are built for companies hiring for themselves. Borderless ATS is designed for staffing and staff augmentation firms that manage multiple positions across different clients simultaneously.

What we solve:
→ AI-powered automatic screening to handle high candidate volumes
→ Customizable pipelines per position/client
→ Interview scheduling with calendar integration
→ Analytics dashboard for data-driven decisions

We're in launch phase and have a Founding Companies Program: {{DESCUENTO}}% permanent discount on final pricing, in exchange for honest monthly feedback.

Would you be open to a 20-minute demo? I can work around your schedule.

Best,
{{TU_NOMBRE}}
Borderless ATS — borderlessats.com`,
      },
    ],
  },
  {
    id: 4,
    channel: "email",
    titleKey: "outreach.t4_title",
    hintKey: "outreach.t4_hint",
    es: [
      {
        label: "Español",
        subject:
          "Re: {{EMPRESA}}: ATS diseñado para staffing (programa fundador abierto)",
        body: `Hola {{NOMBRE}},

Solo quería asegurarme de que mi mensaje anterior llegó bien.

Entiendo que el timing puede no ser el ideal — si ahora no es un buen momento, no hay problema. Pero si en algún punto están evaluando herramientas para gestionar sus procesos de reclutamiento, con gusto agendamos una llamada corta.

El programa fundador cierra cuando se completen los cupos. Una vez cerrado, el precio es precio de mercado.

¿Hay alguien más en tu equipo con quien debería hablar sobre esto?

Saludos,
{{TU_NOMBRE}}`,
      },
    ],
    en: [
      {
        label: "English",
        subject:
          "Re: {{EMPRESA}}: ATS built for staffing firms (founding program open)",
        body: `Hi {{NOMBRE}},

Just wanted to make sure my previous message got through.

I understand the timing might not be right — no worries if so. But if at any point you're evaluating tools to manage your recruiting workflows, I'd be happy to set up a quick call.

The founding program closes once spots are filled. After that, it's standard market pricing.

Is there someone else on your team I should be talking to about this?

Best,
{{TU_NOMBRE}}`,
      },
    ],
  },
  {
    id: 5,
    channel: "email",
    titleKey: "outreach.t5_title",
    hintKey: "outreach.t5_hint",
    es: [
      {
        label: "Español",
        subject: "Cerrando el hilo — {{EMPRESA}}",
        body: `Hola {{NOMBRE}},

No quiero saturarte, así que este será mi último mensaje sobre esto.

Si en algún momento su empresa necesita una solución ATS — especialmente una pensada para el volumen y la dinámica del staffing — estamos en borderlessats.com.

El programa fundador sigue abierto por ahora.

Mucho éxito con {{EMPRESA}}.

{{TU_NOMBRE}}`,
      },
    ],
    en: [
      {
        label: "English",
        subject: "Closing the loop — {{EMPRESA}}",
        body: `Hi {{NOMBRE}},

I don't want to clutter your inbox, so this will be my last message on this.

If your company ever needs an ATS solution — especially one built for the volume and dynamics of staffing — we're at borderlessats.com.

The founding program is still open for now.

Wishing {{EMPRESA}} continued success.

{{TU_NOMBRE}}`,
      },
    ],
  },
  {
    id: 6,
    channel: "whatsapp",
    titleKey: "outreach.t6_title",
    hintKey: "outreach.t6_hint",
    es: [
      {
        label: "Español",
        body: "Hola {{NOMBRE}}, soy {{TU_NOMBRE}}. Te escribo porque estoy lanzando Borderless ATS, un sistema de reclutamiento con IA pensado para empresas de staffing como {{EMPRESA}}. Tenemos un programa fundador con descuento permanente ({{DESCUENTO}}%). ¿Tienes 5 minutos para que te cuente de qué se trata? 🙌",
      },
    ],
    en: [
      {
        label: "English",
        body: "Hi {{NOMBRE}}, I'm {{TU_NOMBRE}}. I'm reaching out because I'm launching Borderless ATS — an AI-powered recruiting system built for staffing firms like {{EMPRESA}}. We have a founding program with a permanent {{DESCUENTO}}% discount. Do you have 5 minutes to hear more? 🙌",
      },
    ],
  },
  {
    id: 7,
    channel: "response",
    titleKey: "outreach.t7_title",
    hintKey: "outreach.t7_hint",
    es: [
      {
        label: "Español",
        body: `Hola {{NOMBRE}}, genial que estés interesado/a.

Te comparto el link para registrarte y empezar la prueba gratuita de 30 días:
👉 https://borderlessats.com/register

El programa fundador se activa automáticamente una vez que hables con nosotros y confirmemos tu empresa. Si prefieres que hablemos primero para que te explique todo en detalle, podemos agendar una llamada rápida — dime qué horario te queda mejor y lo coordinamos.

¿Alguna pregunta antes de empezar?

{{TU_NOMBRE}}`,
      },
    ],
    en: [
      {
        label: "English",
        body: `Hi {{NOMBRE}}, great to hear you're interested.

Here's the link to sign up and start your 30-day free trial:
👉 https://borderlessats.com/register

The founding program is activated once we have a quick chat to confirm your company. If you'd prefer to talk first so I can walk you through everything, happy to schedule a quick call — just let me know what time works best.

Any questions before getting started?

{{TU_NOMBRE}}`,
      },
    ],
  },
  {
    id: 8,
    channel: "email",
    titleKey: "outreach.t8_title",
    hintKey: "outreach.t8_hint",
    es: [
      {
        label: "Español",
        subject: "Resumen de nuestra llamada + próximos pasos — Borderless ATS",
        body: `Hola {{NOMBRE}},

Gracias por tomarte el tiempo hoy. Fue genial entender mejor el proceso de reclutamiento de {{EMPRESA}}.

Como acordamos, acá van los próximos pasos:

1. Prueba gratuita de 30 días → https://borderlessats.com/register
2. Bloqueo del descuento fundador de {{DESCUENTO}}% (te confirmo por este medio una vez que te registres)
3. Onboarding: te ayudo a configurar tu primer pipeline y subir tu equipo

Si tienes dudas durante la prueba, escríbeme directamente a este email o por WhatsApp.

¡Mucho éxito con el proceso!

{{TU_NOMBRE}}
Borderless ATS — borderlessats.com`,
      },
    ],
    en: [
      {
        label: "English",
        subject: "Call summary + next steps — Borderless ATS",
        body: `Hi {{NOMBRE}},

Thanks for taking the time today. It was great to understand {{EMPRESA}}'s recruiting process better.

As we discussed, here are the next steps:

1. 30-day free trial → https://borderlessats.com/register
2. Lock in your {{DESCUENTO}}% founding discount (I'll confirm via this email once you sign up)
3. Onboarding: I'll help you set up your first pipeline and invite your team

If you have any questions during the trial, reach out directly by email or WhatsApp.

Looking forward to working with you!

{{TU_NOMBRE}}
Borderless ATS — borderlessats.com`,
      },
    ],
  },
  {
    id: 9,
    channel: "directory",
    titleKey: "outreach.t9_title",
    hintKey: "outreach.t9_hint",
    es: [
      {
        label: "Español",
        body: `Hola equipo de {{EMPRESA}},

Los encontré en {{CANAL}} y quería contactarlos directamente.

Estoy lanzando Borderless ATS — una plataforma de reclutamiento con IA diseñada específicamente para empresas de staffing y staff augmentation. A diferencia de los ATS genéricos, está construida para manejar alto volumen de candidatos en múltiples posiciones simultáneas.

Tenemos un programa de empresas fundadoras abierto: acceso completo durante 30 días y descuento permanente del {{DESCUENTO}}% a cambio de feedback mensual.

¿Estarían interesados en una demo corta?

{{TU_NOMBRE}} — borderlessats.com`,
      },
    ],
    en: [
      {
        label: "English",
        body: `Hi {{EMPRESA}} team,

I found you on {{CANAL}} and wanted to reach out directly.

I'm launching Borderless ATS — an AI-powered recruiting platform built specifically for staffing and staff augmentation companies. Unlike generic ATS tools, it's designed to handle high candidate volumes across multiple simultaneous positions.

We have a Founding Companies Program open now: full access for 30 days and a permanent {{DESCUENTO}}% discount in exchange for monthly feedback.

Would you be interested in a short demo?

{{TU_NOMBRE}} — borderlessats.com`,
      },
    ],
  },
  {
    id: 10,
    channel: "email",
    titleKey: "outreach.t10_title",
    hintKey: "outreach.t10_hint",
    es: [],
    en: [],
  },
];

const CHANNEL_ICONS: Record<Template["channel"], React.ReactNode> = {
  linkedin: <LinkedInIcon fontSize="small" />,
  email: <EmailIcon fontSize="small" />,
  whatsapp: <WhatsAppIcon fontSize="small" />,
  response: <ReplyIcon fontSize="small" />,
  directory: <SearchIcon fontSize="small" />,
};

interface ProspectSource {
  name: string;
  url: string;
  description: string;
  tipKey: string;
  category: "directory" | "social" | "community" | "search";
}

const PROSPECT_SOURCES: ProspectSource[] = [
  {
    name: "Clutch.co",
    url: "https://clutch.co/it-services/staff-augmentation",
    description:
      "El directorio B2B más grande de empresas de IT staffing y staff augmentation. Tienen reviews verificadas y datos de contacto.",
    tipKey: "outreach.prospect_tip_clutch",
    category: "directory",
  },
  {
    name: "GoodFirms",
    url: "https://www.goodfirms.co/it-services/staff-augmentation",
    description:
      "Directorio similar a Clutch con empresas de staffing rankeadas por reviews y tamaño.",
    tipKey: "outreach.prospect_tip_goodfirms",
    category: "directory",
  },
  {
    name: "LinkedIn — Búsqueda de empresas",
    url: "https://www.linkedin.com/search/results/companies/?keywords=staff%20augmentation",
    description:
      'Buscar "staff augmentation" o "IT staffing" como industria. Filtrar por país, tamaño (11-200 empleados ideal). Ver quién es el CEO/Founder/Head of Talent.',
    tipKey: "outreach.prospect_tip_linkedin",
    category: "social",
  },
  {
    name: "LinkedIn Sales Navigator",
    url: "https://business.linkedin.com/sales-solutions/sales-navigator",
    description:
      "Versión paga de LinkedIn. Permite filtrar por industria (Staffing & Recruiting), cargo (CEO, Founder, CTO), ubicación y tamaño de empresa.",
    tipKey: "outreach.prospect_tip_sales_nav",
    category: "social",
  },
  {
    name: "Upwork — Agencias",
    url: "https://www.upwork.com/nx/search/talent/?nbs=1&q=staff%20augmentation",
    description:
      "Muchas empresas de staff augmentation tienen perfiles como agencias en Upwork. Pueden ser contactadas directamente desde la plataforma.",
    tipKey: "outreach.prospect_tip_upwork",
    category: "directory",
  },
  {
    name: "Toptal — Partners",
    url: "https://www.toptal.com/",
    description:
      "Empresas que compiten con Toptal o lo complementan. Buscar en Google 'Toptal alternative staff augmentation' para encontrar competidores directos.",
    tipKey: "outreach.prospect_tip_toptal",
    category: "search",
  },
  {
    name: "Google Maps / Local",
    url: "https://www.google.com/maps/search/staffing+company",
    description:
      'Buscar "staffing company" o "IT recruiting" en Google Maps con tu ciudad o país objetivo. Aparecen empresas locales con datos de contacto.',
    tipKey: "outreach.prospect_tip_google_maps",
    category: "search",
  },
  {
    name: "Staffing Industry Analysts (SIA)",
    url: "https://www2.staffingindustry.com/",
    description:
      "Asociación global del sector staffing. Publican rankings anuales de las empresas más grandes. Ideal para encontrar empresas medianas en LATAM y Europa.",
    tipKey: "outreach.prospect_tip_sia",
    category: "community",
  },
  {
    name: "Reddit — r/staffing",
    url: "https://www.reddit.com/r/staffing/",
    description:
      "Comunidad de reclutadores y dueños de agencias. Leer conversaciones para entender pain points. Contactar directamente a quienes mencionan problemas con su ATS.",
    tipKey: "outreach.prospect_tip_reddit",
    category: "community",
  },
  {
    name: "Crunchbase",
    url: "https://www.crunchbase.com/search/organizations?q=staffing",
    description:
      "Base de datos de startups y empresas. Filtrar por industria Staffing & Recruiting, país, y tamaño. Incluye emails de fundadores en algunos casos.",
    tipKey: "outreach.prospect_tip_crunchbase",
    category: "directory",
  },
];

const CATEGORY_COLORS: Record<
  ProspectSource["category"],
  "primary" | "secondary" | "success" | "warning"
> = {
  directory: "primary",
  social: "secondary",
  community: "success",
  search: "warning",
};

function applyVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

interface EditDialogState {
  open: boolean;
  key: string;
  hasSubject: boolean;
  subject: string;
  body: string;
}

interface EditDialogProps {
  state: EditDialogState;
  onClose: () => void;
  onSave: (subject: string, body: string) => void;
  onReset: () => void;
  isSaving?: boolean;
  isResetting?: boolean;
}

const EditTemplateDialog: React.FC<EditDialogProps> = ({
  state,
  onClose,
  onSave,
  onReset,
  isSaving,
  isResetting,
}) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState(state.subject);
  const [body, setBody] = useState(state.body);
  const isLoading = isSaving || isResetting;

  return (
    <Dialog open={state.open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("outreach.edit_template")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {state.hasSubject && (
            <TextField
              label={t("outreach.subject")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              size="small"
              disabled={isLoading}
            />
          )}
          <TextField
            label={
              state.hasSubject ? t("outreach.body") : t("outreach.message")
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            multiline
            rows={10}
            disabled={isLoading}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          color="warning"
          onClick={onReset}
          disabled={isLoading}
        >
          {t("outreach.reset_to_default")}
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={() => onSave(subject, body)}
            disabled={isLoading}
          >
            {t("common.save")}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

const CAMPAIGN_TEMPLATE_ID = 10;

const OutreachTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();

  const [pageTab, setPageTab] = useState(0);
  const [selectedId, setSelectedId] = useState(1);
  const [lang, setLang] = useState<"es" | "en">("es");
  const [varsOpen, setVarsOpen] = useState(true);
  const [varValues, setVarValues] = useState<Record<string, string>>(
    Object.fromEntries(VARIABLES.map((v) => [v.key, v.defaultVal])),
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editDialogState, setEditDialogState] =
    useState<EditDialogState | null>(null);

  const { data: overridesData } = useOutreachTemplateOverrides();
  const upsertMutation = useUpsertOutreachTemplateOverride();
  const deleteMutation = useDeleteOutreachTemplateOverride();

  const { data: emailTemplates } = useEmailTemplates(user?.companyUid);
  const updateEmailTemplateMutation = useUpdateEmailTemplate();
  const campaignEmailTemplate = emailTemplates?.find(
    (et) => et.type === EmailTemplateType.OUTREACH,
  );

  const editedTemplates = useMemo(() => {
    const map: Record<string, { subject?: string; body: string }> = {};
    (overridesData ?? []).forEach((o) => {
      map[`${o.templateId}-${o.lang}-${o.variantIndex}`] = {
        subject: o.subject,
        body: o.body,
      };
    });
    return map;
  }, [overridesData]);

  const template = TEMPLATES.find((t) => t.id === selectedId)!;
  const variants = lang === "es" ? template.es : template.en;

  const handleVarChange = (key: string, value: string) => {
    setVarValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const handleSaveEdit = async (subject: string, body: string) => {
    if (!editDialogState) return;
    if (editDialogState.key === "campaign") {
      await handleSaveCampaignTemplate(subject, body);
      return;
    }
    const [templateIdStr, langStr, variantIndexStr] =
      editDialogState.key.split("-");
    await upsertMutation.mutateAsync({
      templateId: Number(templateIdStr),
      lang: langStr,
      variantIndex: Number(variantIndexStr),
      subject: editDialogState.hasSubject ? subject : undefined,
      body,
    });
    setEditDialogState(null);
  };

  const handleResetEdit = async () => {
    if (!editDialogState) return;
    if (editDialogState.key === "campaign") {
      setEditDialogState(null);
      return;
    }
    const [templateIdStr, langStr, variantIndexStr] =
      editDialogState.key.split("-");
    await deleteMutation.mutateAsync({
      templateId: Number(templateIdStr),
      lang: langStr,
      variantIndex: Number(variantIndexStr),
    });
    setEditDialogState(null);
  };

  const handleSaveCampaignTemplate = async (subject: string, body: string) => {
    if (!campaignEmailTemplate) return;
    await updateEmailTemplateMutation.mutateAsync({
      uid: campaignEmailTemplate.uid,
      data: { subject, body },
    });
    setEditDialogState(null);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          {t("outreach.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("outreach.subtitle")}
        </Typography>
      </Box>

      {/* Page tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={pageTab} onChange={(_, v) => setPageTab(v)}>
          <Tab label={t("outreach.tab_templates")} />
          <Tab
            label={t("outreach.tab_prospecting")}
            icon={<TravelExploreIcon fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* ── TAB 0: Templates ──────────────────────────────────────── */}
      {pageTab === 0 && (
        <>
          {/* Variables panel */}
          <Paper
            variant="outlined"
            sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                bgcolor: "action.hover",
              }}
              onClick={() => setVarsOpen((p) => !p)}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {t("outreach.variables_title")}
              </Typography>
              <IconButton size="small">
                {varsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={varsOpen}>
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 2, display: "block" }}
                >
                  {t("outreach.variables_hint")}
                </Typography>
                <Grid container spacing={2}>
                  {VARIABLES.map((v) => (
                    <Grid key={v.key} size={{ xs: 6, sm: 4, md: 3 }}>
                      <TextField
                        size="small"
                        fullWidth
                        label={`{{${v.key}}}`}
                        value={varValues[v.key]}
                        onChange={(e) => handleVarChange(v.key, e.target.value)}
                        slotProps={{
                          inputLabel: {
                            sx: { fontFamily: "monospace", fontSize: "0.8rem" },
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Collapse>
          </Paper>

          {/* Main layout */}
          <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
            {/* Template list */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, overflow: "hidden" }}
              >
                <Box sx={{ px: 2, py: 1.5, bgcolor: "action.hover" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t("outreach.templates_label")}
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {TEMPLATES.map((tmpl, index) => (
                    <React.Fragment key={tmpl.id}>
                      {index > 0 && <Divider />}
                      <ListItemButton
                        selected={selectedId === tmpl.id}
                        onClick={() => setSelectedId(tmpl.id)}
                        sx={{
                          py: 1.25,
                          "&.Mui-selected": {
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            "& .MuiListItemText-secondary": {
                              color: "rgba(255,255,255,0.7)",
                            },
                            "& svg": { color: "primary.contrastText" },
                            "&:hover": { bgcolor: "primary.dark" },
                          },
                        }}
                      >
                        <Box
                          sx={{
                            mr: 1.5,
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {CHANNEL_ICONS[tmpl.channel]}
                        </Box>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              fontWeight={selectedId === tmpl.id ? 600 : 400}
                            >
                              {`${tmpl.id}. ${t(tmpl.titleKey)}`}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Template content */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, overflow: "hidden" }}
              >
                {/* Template header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    {CHANNEL_ICONS[template.channel]}
                    <Typography variant="subtitle2" fontWeight={600}>
                      {`${template.id}. ${t(template.titleKey)}`}
                    </Typography>
                    <Chip
                      label={t(`outreach.channel_${template.channel}`)}
                      size="small"
                      variant="filled"
                    />
                  </Stack>
                  <ToggleButtonGroup
                    value={lang}
                    exclusive
                    onChange={(_, val) => val && setLang(val)}
                    size="small"
                  >
                    <ToggleButton value="es">🇪🇸 ES</ToggleButton>
                    <ToggleButton value="en">🇺🇸 EN</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Hint */}
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: "background.default",
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontStyle="italic"
                  >
                    {t(template.hintKey)}
                  </Typography>
                </Box>

                {/* Campaign email template (ID 10) */}
                {selectedId === CAMPAIGN_TEMPLATE_ID && (
                  <Box sx={{ p: 2 }}>
                    {!campaignEmailTemplate ? (
                      <Stack spacing={1.5}>
                        <Typography variant="body2" color="text.secondary">
                          {t("outreach.t10_no_template")}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontStyle="italic"
                        >
                          {t("outreach.t10_create_hint")}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        {/* Subject */}
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={600}
                            >
                              {t("outreach.subject")}
                            </Typography>
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title={t("outreach.edit_body")}>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setEditDialogState({
                                      open: true,
                                      key: "campaign",
                                      hasSubject: true,
                                      subject:
                                        campaignEmailTemplate.subject ?? "",
                                      body: campaignEmailTemplate.body,
                                    })
                                  }
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={
                                  copiedKey === "campaign-subject"
                                    ? t("outreach.copied")
                                    : t("outreach.copy")
                                }
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopy(
                                      campaignEmailTemplate.subject ?? "",
                                      "campaign-subject",
                                    )
                                  }
                                >
                                  {copiedKey === "campaign-subject" ? (
                                    <CheckIcon
                                      fontSize="small"
                                      color="success"
                                    />
                                  ) : (
                                    <ContentCopyIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                          <Paper
                            variant="outlined"
                            sx={{
                              px: 2,
                              py: 1,
                              borderRadius: 1,
                              bgcolor: "action.hover",
                              fontFamily: "monospace",
                              fontSize: "0.875rem",
                            }}
                          >
                            {campaignEmailTemplate.subject}
                          </Paper>
                        </Box>
                        {/* Body */}
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={600}
                            >
                              {t("outreach.body")}
                            </Typography>
                            <Button
                              size="small"
                              variant={
                                copiedKey === "campaign-body"
                                  ? "contained"
                                  : "outlined"
                              }
                              color={
                                copiedKey === "campaign-body"
                                  ? "success"
                                  : "primary"
                              }
                              startIcon={
                                copiedKey === "campaign-body" ? (
                                  <CheckIcon fontSize="small" />
                                ) : (
                                  <ContentCopyIcon fontSize="small" />
                                )
                              }
                              onClick={() =>
                                handleCopy(
                                  campaignEmailTemplate.body,
                                  "campaign-body",
                                )
                              }
                            >
                              {copiedKey === "campaign-body"
                                ? t("outreach.copied")
                                : t("outreach.copy")}
                            </Button>
                          </Box>
                          <Paper
                            variant="outlined"
                            sx={{
                              px: 2,
                              py: 1.5,
                              borderRadius: 1,
                              bgcolor: "background.default",
                              whiteSpace: "pre-wrap",
                              fontFamily: "inherit",
                              fontSize: "0.875rem",
                              lineHeight: 1.7,
                            }}
                          >
                            {campaignEmailTemplate.body}
                          </Paper>
                        </Box>
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() =>
                              setEditDialogState({
                                open: true,
                                key: "campaign",
                                hasSubject: true,
                                subject: campaignEmailTemplate.subject ?? "",
                                body: campaignEmailTemplate.body,
                              })
                            }
                          >
                            {t("outreach.edit_template")}
                          </Button>
                        </Box>
                      </Stack>
                    )}
                  </Box>
                )}

                {/* Variants (templates 1-9) */}
                {selectedId !== CAMPAIGN_TEMPLATE_ID && (
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={3}>
                      {variants.map((variant, idx) => {
                        const variantKey = `${selectedId}-${lang}-${idx}`;
                        const subjectKey = `subject-${selectedId}-${lang}-${idx}`;
                        const bodyKey = `body-${selectedId}-${lang}-${idx}`;
                        const edited = editedTemplates[variantKey];
                        const isModified = !!edited;
                        const effectiveSubject =
                          edited?.subject ?? variant.subject;
                        const effectiveBody = edited?.body ?? variant.body;
                        const resolvedSubject = effectiveSubject
                          ? applyVars(effectiveSubject, varValues)
                          : null;
                        const resolvedBody = applyVars(
                          effectiveBody,
                          varValues,
                        );

                        return (
                          <Box key={idx}>
                            {variants.length > 1 && (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 1 }}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight={600}
                                  color="text.secondary"
                                >
                                  {variant.label}
                                </Typography>
                                {isModified && (
                                  <Chip
                                    label={t("outreach.modified_badge")}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            )}

                            {/* Subject line */}
                            {resolvedSubject && (
                              <Box sx={{ mb: 1.5 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                  >
                                    {t("outreach.subject")}
                                  </Typography>
                                  <Tooltip
                                    title={
                                      copiedKey === subjectKey
                                        ? t("outreach.copied")
                                        : t("outreach.copy")
                                    }
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleCopy(resolvedSubject, subjectKey)
                                      }
                                    >
                                      {copiedKey === subjectKey ? (
                                        <CheckIcon
                                          fontSize="small"
                                          color="success"
                                        />
                                      ) : (
                                        <ContentCopyIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    borderRadius: 1,
                                    bgcolor: "action.hover",
                                    fontFamily: "monospace",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {resolvedSubject}
                                </Paper>
                              </Box>
                            )}

                            {/* Body */}
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  mb: 0.5,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                  >
                                    {variant.subject
                                      ? t("outreach.body")
                                      : t("outreach.message")}
                                  </Typography>
                                  {isModified && variants.length === 1 && (
                                    <Chip
                                      label={t("outreach.modified_badge")}
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                    />
                                  )}
                                </Stack>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  <Tooltip title={t("outreach.edit_body")}>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        setEditDialogState({
                                          open: true,
                                          key: variantKey,
                                          hasSubject: !!variant.subject,
                                          subject: effectiveSubject ?? "",
                                          body: effectiveBody,
                                        })
                                      }
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Button
                                    size="small"
                                    variant={
                                      copiedKey === bodyKey
                                        ? "contained"
                                        : "outlined"
                                    }
                                    color={
                                      copiedKey === bodyKey
                                        ? "success"
                                        : "primary"
                                    }
                                    startIcon={
                                      copiedKey === bodyKey ? (
                                        <CheckIcon fontSize="small" />
                                      ) : (
                                        <ContentCopyIcon fontSize="small" />
                                      )
                                    }
                                    onClick={() =>
                                      handleCopy(resolvedBody, bodyKey)
                                    }
                                  >
                                    {copiedKey === bodyKey
                                      ? t("outreach.copied")
                                      : t("outreach.copy")}
                                  </Button>
                                </Stack>
                              </Box>
                              <Paper
                                variant="outlined"
                                sx={{
                                  px: 2,
                                  py: 1.5,
                                  borderRadius: 1,
                                  bgcolor: "background.default",
                                  whiteSpace: "pre-wrap",
                                  fontFamily: "inherit",
                                  fontSize: "0.875rem",
                                  lineHeight: 1.7,
                                  color: "text.primary",
                                }}
                              >
                                {resolvedBody}
                              </Paper>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* ── TAB 1: Prospecting guide ───────────────────────────────── */}
      {pageTab === 1 && (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("outreach.prospect_intro")}
          </Typography>

          <Grid container spacing={2}>
            {PROSPECT_SOURCES.map((source) => (
              <Grid key={source.name} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {source.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={t(`outreach.category_${source.category}`)}
                        size="small"
                        color={CATEGORY_COLORS[source.category]}
                        variant="filled"
                      />
                      <Tooltip title={t("outreach.open_link")}>
                        <IconButton
                          size="small"
                          onClick={() => window.open(source.url, "_blank")}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flex: 1 }}
                  >
                    {source.description}
                  </Typography>

                  <Box
                    sx={{
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      px: 1.5,
                      py: 1,
                      borderLeft: "3px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      <strong>{t("outreach.tip_label")}</strong>{" "}
                      {t(source.tipKey)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Recommended workflow */}
          <Paper variant="outlined" sx={{ mt: 3, p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              {t("outreach.workflow_title")}
            </Typography>
            <Stack spacing={1}>
              {[1, 2, 3, 4, 5].map((step) => (
                <Box
                  key={step}
                  sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {step}
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ pt: 0.25 }}
                  >
                    {t(`outreach.workflow_step_${step}`)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>
      )}

      {editDialogState && (
        <EditTemplateDialog
          state={editDialogState}
          onClose={() => setEditDialogState(null)}
          onSave={handleSaveEdit}
          onReset={handleResetEdit}
          isSaving={upsertMutation.isPending}
          isResetting={deleteMutation.isPending}
        />
      )}
    </Box>
  );
};

export default OutreachTemplatesPage;

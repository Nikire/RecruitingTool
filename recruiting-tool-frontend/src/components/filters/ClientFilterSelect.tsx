import { MenuItem, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useClients } from "../../hooks/api/useClients";

export interface ClientFilterSelectProps {
  /** Currently selected client UID, or "" for "all clients". */
  value: string;
  onChange: (clientUid: string) => void;
  /** Rendered with no wrapper so the caller controls layout. */
  fullWidth?: boolean;
  size?: "small" | "medium";
}

/**
 * ClientFilterSelect — narrows a list to one end client (account).
 *
 * This is the filter that makes "show me every open role for Acme" answerable, so it is
 * shared by the job positions and hiring processes list pages rather than duplicated.
 *
 * Renders nothing at all when the company has no clients: an agency that never uses
 * accounts should not be shown a permanently empty dropdown.
 */
const ClientFilterSelect: React.FC<ClientFilterSelectProps> = ({
  value,
  onChange,
  fullWidth = false,
  size = "small",
}) => {
  const { t } = useTranslation();
  const { data: clients, isLoading } = useClients();

  if (!isLoading && (!clients || clients.length === 0)) {
    return null;
  }

  return (
    <TextField
      select
      label={t("clients.filter_label")}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      size={size}
      fullWidth={fullWidth}
      disabled={isLoading}
      inputProps={{ "aria-label": t("clients.filter_aria") }}
      sx={{ minWidth: 220 }}
    >
      <MenuItem value="">
        <em>{t("clients.filter_all")}</em>
      </MenuItem>
      {(clients ?? []).map((client) => (
        <MenuItem key={client.uid} value={client.uid}>
          {client.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default ClientFilterSelect;

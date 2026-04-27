import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Avatar,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessIcon from "@mui/icons-material/Business";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { PageHeader, ConfirmationDialog } from "../../components/common";
import {
  AdminTask,
  AdminTaskStatus,
  AdminTaskPriority,
  CreateAdminTaskPayload,
  useAdminTasks,
  useCreateAdminTask,
  useUpdateAdminTask,
  useDeleteAdminTask,
} from "../../api/adminTasks";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { User } from "../../types/user.types";
import { Company } from "../../types/company.types";

const STATUSES: AdminTaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

const PRIORITIES: AdminTaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function useAdminUsers() {
  return useQuery<User[]>({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const res = await api.get<User[]>("/users");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useAllCompanies() {
  return useQuery<Company[]>({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const res = await api.get<Company[]>("/company");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

type PriorityColor =
  | "default"
  | "info"
  | "warning"
  | "error"
  | "success"
  | "primary"
  | "secondary";

function priorityColor(p: AdminTaskPriority): PriorityColor {
  if (p === "LOW") return "default";
  if (p === "MEDIUM") return "info";
  if (p === "HIGH") return "warning";
  return "error";
}

const COLUMN_META: Record<
  AdminTaskStatus,
  { labelKey: string; colorKey: string }
> = {
  TODO: { labelKey: "admin_tasks.col_todo", colorKey: "text.secondary" },
  IN_PROGRESS: {
    labelKey: "admin_tasks.col_in_progress",
    colorKey: "info.main",
  },
  IN_REVIEW: {
    labelKey: "admin_tasks.col_in_review",
    colorKey: "warning.main",
  },
  DONE: { labelKey: "admin_tasks.col_done", colorKey: "success.main" },
};

interface TaskFormState {
  title: string;
  description: string;
  status: AdminTaskStatus;
  priority: AdminTaskPriority;
  dueDate: string;
  labels: string[];
  labelInput: string;
  assignedToUid: string;
  linkedCompanyUid: string;
}

const emptyForm = (): TaskFormState => ({
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  labels: [],
  labelInput: "",
  assignedToUid: "",
  linkedCompanyUid: "",
});

function taskToForm(task: AdminTask): TaskFormState {
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    labels: task.labels,
    labelInput: "",
    assignedToUid: task.assignedTo?.uid ?? "",
    linkedCompanyUid: task.linkedCompany?.uid ?? "",
  };
}

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: AdminTask;
  users: User[];
  companies: Company[];
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onClose,
  task,
  users,
  companies,
}) => {
  const { t } = useTranslation();
  const createMutation = useCreateAdminTask();
  const updateMutation = useUpdateAdminTask();
  const [form, setForm] = useState<TaskFormState>(
    task ? taskToForm(task) : emptyForm(),
  );

  const isEdit = !!task;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const set = <K extends keyof TaskFormState>(key: K, val: TaskFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && form.labelInput.trim()) {
      e.preventDefault();
      if (!form.labels.includes(form.labelInput.trim())) {
        set("labels", [...form.labels, form.labelInput.trim()]);
      }
      set("labelInput", "");
    }
  };

  const removeLabel = (label: string) => {
    set(
      "labels",
      form.labels.filter((l) => l !== label),
    );
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;

    const payload: CreateAdminTaskPayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      labels: form.labels,
      assignedToUid: form.assignedToUid || undefined,
      linkedCompanyUid: form.linkedCompanyUid || undefined,
    };

    try {
      if (isEdit && task) {
        await updateMutation.mutateAsync({ uid: task.uid, ...payload });
        toast.success(t("admin_tasks.updated_success"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("admin_tasks.created_success"));
      }
      onClose();
    } catch {
      toast.error(t("admin_tasks.error"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? t("admin_tasks.edit_task") : t("admin_tasks.add_task")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t("admin_tasks.field_title")}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label={t("admin_tasks.field_description")}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            multiline
            rows={3}
            fullWidth
            size="small"
          />
          <Stack direction="row" spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t("admin_tasks.field_status")}</InputLabel>
              <Select
                value={form.status}
                label={t("admin_tasks.field_status")}
                onChange={(e) =>
                  set("status", e.target.value as AdminTaskStatus)
                }
              >
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {t(`admin_tasks.col_${s.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>{t("admin_tasks.field_priority")}</InputLabel>
              <Select
                value={form.priority}
                label={t("admin_tasks.field_priority")}
                onChange={(e) =>
                  set("priority", e.target.value as AdminTaskPriority)
                }
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {t(`admin_tasks.priority_${p.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label={t("admin_tasks.field_due_date")}
            type="date"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <Box>
            <TextField
              label={t("admin_tasks.field_labels")}
              placeholder={t("admin_tasks.field_labels_hint")}
              value={form.labelInput}
              onChange={(e) => set("labelInput", e.target.value)}
              onKeyDown={handleLabelKeyDown}
              fullWidth
              size="small"
            />
            {form.labels.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                {form.labels.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    onDelete={() => removeLabel(label)}
                    variant="filled"
                  />
                ))}
              </Box>
            )}
          </Box>
          <FormControl size="small" fullWidth>
            <InputLabel>{t("admin_tasks.field_assignee")}</InputLabel>
            <Select
              value={form.assignedToUid}
              label={t("admin_tasks.field_assignee")}
              onChange={(e) => set("assignedToUid", e.target.value)}
            >
              <MenuItem value="">
                <em>{t("admin_tasks.no_assignee")}</em>
              </MenuItem>
              {users.map((u) => (
                <MenuItem key={u.uid} value={u.uid}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>{t("admin_tasks.field_company")}</InputLabel>
            <Select
              value={form.linkedCompanyUid}
              label={t("admin_tasks.field_company")}
              onChange={(e) => set("linkedCompanyUid", e.target.value)}
            >
              <MenuItem value="">
                <em>{t("admin_tasks.no_company")}</em>
              </MenuItem>
              {companies.map((c) => (
                <MenuItem key={c.uid} value={c.uid}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending || !form.title.trim()}
        >
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface TaskCardProps {
  task: AdminTask;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (task: AdminTask) => void;
  onDelete: (task: AdminTask) => void;
  onMove: (task: AdminTask, direction: "prev" | "next") => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMove,
}) => {
  const { t } = useTranslation();
  const overdue =
    task.dueDate && isOverdue(task.dueDate) && task.status !== "DONE";
  const visibleLabels = task.labels.slice(0, 2);
  const extraLabels = task.labels.length - 2;

  return (
    <Card
      elevation={1}
      sx={{
        mb: 1,
        cursor: "pointer",
        transition: "box-shadow 0.15s",
        "&:hover": { boxShadow: 4 },
        "& .task-actions": { opacity: 0 },
        "&:hover .task-actions": { opacity: 1 },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack spacing={0.75}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 0.5,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ flex: 1, lineHeight: 1.3 }}
            >
              {task.title}
            </Typography>
            <Box
              className="task-actions"
              sx={{ display: "flex", gap: 0.25, flexShrink: 0 }}
            >
              {!isFirst && (
                <Tooltip title="">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(task, "prev");
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <ArrowBackIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
              {!isLast && (
                <Tooltip title="">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(task, "next");
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <ArrowForwardIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                sx={{ p: 0.25 }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                sx={{ p: 0.25 }}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Box>
          </Box>

          {task.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {task.description}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={t(`admin_tasks.priority_${task.priority.toLowerCase()}`)}
              color={priorityColor(task.priority)}
              variant="filled"
              size="small"
            />
            {visibleLabels.map((label) => (
              <Chip
                key={label}
                label={label}
                variant="outlined"
                size="small"
                sx={{ fontSize: "0.65rem", height: 18 }}
              />
            ))}
            {extraLabels > 0 && (
              <Typography variant="caption" color="text.secondary">
                +{extraLabels}
              </Typography>
            )}
          </Box>

          {task.linkedCompany && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <BusinessIcon sx={{ fontSize: 12, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {task.linkedCompany.name}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 0.25,
            }}
          >
            {task.assignedTo ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Avatar
                  sx={{
                    width: 18,
                    height: 18,
                    fontSize: "0.6rem",
                    bgcolor: "primary.main",
                  }}
                >
                  {task.assignedTo.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {task.assignedTo.name}
                </Typography>
              </Box>
            ) : (
              <Box />
            )}
            {task.dueDate && (
              <Typography
                variant="caption"
                color={overdue ? "error.main" : "text.secondary"}
                fontWeight={overdue ? 600 : 400}
              >
                {overdue ? t("admin_tasks.overdue") : ""}{" "}
                {formatDate(task.dueDate)}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const AdminTasksPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: tasks = [], isLoading } = useAdminTasks();
  const { data: users = [] } = useAdminUsers();
  const { data: companies = [] } = useAllCompanies();
  const updateMutation = useUpdateAdminTask();
  const deleteMutation = useDeleteAdminTask();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<AdminTask | undefined>(undefined);
  const [deleteTask, setDeleteTask] = useState<AdminTask | undefined>(
    undefined,
  );
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<AdminTaskPriority | "">(
    "",
  );
  const [filterAssignee, setFilterAssignee] = useState("");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterAssignee && t.assignedTo?.uid !== filterAssignee) return false;
      return true;
    });
  }, [tasks, search, filterPriority, filterAssignee]);

  const byStatus = useMemo(() => {
    const map: Record<AdminTaskStatus, AdminTask[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    filtered.forEach((task) => map[task.status].push(task));
    return map;
  }, [filtered]);

  const handleOpenCreate = () => {
    setEditTask(undefined);
    setDialogOpen(true);
  };

  const handleOpenEdit = (task: AdminTask) => {
    setEditTask(task);
    setDialogOpen(true);
  };

  const handleMove = async (task: AdminTask, direction: "prev" | "next") => {
    const idx = STATUSES.indexOf(task.status);
    const nextStatus =
      direction === "next" ? STATUSES[idx + 1] : STATUSES[idx - 1];
    if (!nextStatus) return;
    try {
      await updateMutation.mutateAsync({ uid: task.uid, status: nextStatus });
    } catch {
      toast.error(t("admin_tasks.error"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTask) return;
    try {
      await deleteMutation.mutateAsync(deleteTask.uid);
      toast.success(t("admin_tasks.deleted_success"));
    } catch {
      toast.error(t("admin_tasks.error"));
    } finally {
      setDeleteTask(undefined);
    }
  };

  const assigneesInUse = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((task) => {
      if (task.assignedTo) map.set(task.assignedTo.uid, task.assignedTo.name);
    });
    return Array.from(map.entries()).map(([uid, name]) => ({ uid, name }));
  }, [tasks]);

  return (
    <Box>
      <PageHeader
        title="admin_tasks.title"
        subtitle="admin_tasks.subtitle"
        translate={true}
        action={{
          label: "admin_tasks.add_task",
          icon: <AddIcon />,
          onClick: handleOpenCreate,
        }}
      />

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder={t("admin_tasks.search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{t("admin_tasks.filter_priority")}</InputLabel>
          <Select
            value={filterPriority}
            label={t("admin_tasks.filter_priority")}
            onChange={(e) =>
              setFilterPriority(e.target.value as AdminTaskPriority | "")
            }
          >
            <MenuItem value="">
              <em>{t("common.filter")}</em>
            </MenuItem>
            {PRIORITIES.map((p) => (
              <MenuItem key={p} value={p}>
                {t(`admin_tasks.priority_${p.toLowerCase()}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t("admin_tasks.filter_assignee")}</InputLabel>
          <Select
            value={filterAssignee}
            label={t("admin_tasks.filter_assignee")}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <MenuItem value="">
              <em>{t("common.filter")}</em>
            </MenuItem>
            {assigneesInUse.map((a) => (
              <MenuItem key={a.uid} value={a.uid}>
                {a.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Typography color="text.secondary">{t("common.loading")}</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
            alignItems: "start",
          }}
        >
          {STATUSES.map((status) => {
            const meta = COLUMN_META[status];
            const colTasks = byStatus[status];
            const resolvedColor =
              meta.colorKey === "text.secondary"
                ? theme.palette.text.secondary
                : meta.colorKey === "info.main"
                  ? theme.palette.info.main
                  : meta.colorKey === "warning.main"
                    ? theme.palette.warning.main
                    : theme.palette.success.main;
            return (
              <Box key={status}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    minHeight: 200,
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      backgroundColor: alpha(resolvedColor, 0.1),
                      borderLeft: `4px solid`,
                      borderLeftColor: resolvedColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ color: meta.colorKey }}
                    >
                      {t(meta.labelKey)}
                    </Typography>
                    <Chip
                      label={colTasks.length}
                      size="small"
                      variant="filled"
                      sx={{
                        bgcolor: alpha(resolvedColor, 0.2),
                        color: meta.colorKey,
                        fontWeight: 700,
                        minWidth: 24,
                        height: 20,
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 1 }}>
                    {colTasks.length === 0 ? (
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: "block", textAlign: "center", py: 2 }}
                      >
                        {t("admin_tasks.no_tasks")}
                      </Typography>
                    ) : (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.uid}
                          task={task}
                          isFirst={status === STATUSES[0]}
                          isLast={status === STATUSES[STATUSES.length - 1]}
                          onEdit={handleOpenEdit}
                          onDelete={setDeleteTask}
                          onMove={handleMove}
                        />
                      ))
                    )}
                  </Box>
                </Paper>
              </Box>
            );
          })}
        </Box>
      )}

      {dialogOpen && (
        <TaskDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          task={editTask}
          users={users}
          companies={companies}
        />
      )}

      <ConfirmationDialog
        open={!!deleteTask}
        onClose={() => setDeleteTask(undefined)}
        onConfirm={handleDelete}
        title={t("admin_tasks.delete_task")}
        message={t("admin_tasks.confirm_delete")}
        severity="error"
        isLoading={deleteMutation.isPending}
      />
    </Box>
  );
};

export default AdminTasksPage;

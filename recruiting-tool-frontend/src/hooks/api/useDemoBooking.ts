import { demoBookingKeys } from "../../api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { showErrorToast } from "../../utils/toast";
import {
  requestDemo,
  getDemoSlots,
  getDemoSettings,
  confirmDemoSlot,
} from "../../api/demoBooking";

export const useRequestDemo = () =>
  useMutation({
    mutationFn: requestDemo,
  });

export const useDemoSlots = (token: string | null) =>
  useQuery({
    queryKey: demoBookingKeys.slots(token),
    queryFn: () => getDemoSlots(token!),
    enabled: !!token,
  });

export const useDemoSettings = (token: string | null) =>
  useQuery({
    queryKey: demoBookingKeys.settings(token),
    queryFn: () => getDemoSettings(token!),
    enabled: !!token,
  });

export const useConfirmDemoSlot = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ token, slotUid }: { token: string; slotUid: string }) =>
      confirmDemoSlot(token, slotUid),
    onError: (error) => {
      showErrorToast(error, t("booking.confirm_error_title"));
    },
  });
};

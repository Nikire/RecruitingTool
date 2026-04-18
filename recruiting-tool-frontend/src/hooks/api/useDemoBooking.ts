import { useMutation, useQuery } from "@tanstack/react-query";
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
    queryKey: ["demo-slots", token],
    queryFn: () => getDemoSlots(token!),
    enabled: !!token,
  });

export const useDemoSettings = (token: string | null) =>
  useQuery({
    queryKey: ["demo-settings", token],
    queryFn: () => getDemoSettings(token!),
    enabled: !!token,
  });

export const useConfirmDemoSlot = () =>
  useMutation({
    mutationFn: ({ token, slotUid }: { token: string; slotUid: string }) =>
      confirmDemoSlot(token, slotUid),
  });

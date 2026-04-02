import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useNotifications } from "../context/NotificationContext";
import { toast } from "react-toastify";

const NotificationListener = () => {
  const socket = useSocket();
  const { refresh } = useNotifications(); // plus besoin de addNotification

  useEffect(() => {
    if (!socket) return;

    const onDonationValidated = (data) => {
      toast.success(data.message);
      refresh();
    };

    const onDemandeUpdated = (data) => {
      toast.info(`Nouveau don sur demande #${data.demandeId}`);
      refresh();
    };

    const onCampagneUpdated = (data) => {
      toast.info(`Don reçu pour campagne #${data.campagneId}`);
      refresh();
    };

    const onDemandeStatusChanged = (data) => {
      toast.info(`Statut demande #${data.demandeId} : ${data.newStatus}`);
      refresh();
    };

    const onNewCampaign = (data) => {
      toast.info(`Nouvelle campagne : ${data.campagne.titre}`);
      refresh();
    };

    const onCampaignGoalReached = (data) => {
      toast.success(`Objectif atteint : ${data.titre}`);
      refresh();
    };

    socket.on("donation_validated", onDonationValidated);
    socket.on("demande_updated", onDemandeUpdated);
    socket.on("campagne_updated", onCampagneUpdated);
    socket.on("demande_status_changed", onDemandeStatusChanged);
    socket.on("new_campaign", onNewCampaign);
    socket.on("campaign_goal_reached", onCampaignGoalReached);

    return () => {
      socket.off("donation_validated", onDonationValidated);
      socket.off("demande_updated", onDemandeUpdated);
      socket.off("campagne_updated", onCampagneUpdated);
      socket.off("demande_status_changed", onDemandeStatusChanged);
      socket.off("new_campaign", onNewCampaign);
      socket.off("campaign_goal_reached", onCampaignGoalReached);
    };
  }, [socket, refresh]);

  return null;
};

export default NotificationListener;
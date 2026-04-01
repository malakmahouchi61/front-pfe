// components/NotificationListener.jsx
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useNotifications } from "../context/NotificationContext";
import { toast } from "react-toastify";

/**
 * Composant invisible qui écoute les événements Socket.IO
 * et les transforme en notifications contextuelles.
 *
 * Grâce au SocketProvider, le socket est déjà authentifié
 * avec le JWT de l'utilisateur connecté. Le serveur place
 * chaque socket dans la room `user_<id>`, donc seul cet
 * utilisateur reçoit ses propres notifications.
 */
const NotificationListener = () => {
  const socket = useSocket();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Si pas de socket (utilisateur déconnecté), rien à écouter
    if (!socket) return;

    // ── Don validé (serveur émet dans room user_<id>) ──────────────
    const onDonationValidated = (data) => {
      toast.success(data.message, { autoClose: 5000 });
      addNotification({
        type: "donation",
        title: "Don validé ✅",
        message: data.message,
        icon: "💰",
        data,
      });
    };

    // ── Demande mise à jour ─────────────────────────────────────────
    const onDemandeUpdated = (data) => {
      const msg = `Un nouveau don a été fait sur votre demande #${data.demandeId}`;
      toast.info(msg);
      addNotification({
        type: "demande",
        title: "Demande mise à jour",
        message: msg,
        icon: "📋",
        data,
      });
    };

    // ── Campagne mise à jour ────────────────────────────────────────
    const onCampagneUpdated = (data) => {
      const msg = `Votre campagne #${data.campagneId} a reçu un don !`;
      toast.info(msg);
      addNotification({
        type: "campagne",
        title: "Campagne mise à jour",
        message: msg,
        icon: "🎯",
        data,
      });
    };

    // ── Statut de demande changé ────────────────────────────────────
    const onDemandeStatusChanged = (data) => {
      const msg = `Votre demande #${data.demandeId} est maintenant "${data.newStatus}"`;
      toast.info(msg);
      addNotification({
        type: "status",
        title: "Statut changé",
        message: msg,
        icon: "🔄",
        data,
      });
    };

    // ── Nouvelle campagne ───────────────────────────────────────────
    const onNewCampaign = (data) => {
      const msg = `Nouvelle campagne : "${data.campagne.titre}"`;
      toast.info(msg);
      addNotification({
        type: "campagne",
        title: "Nouvelle campagne",
        message: msg,
        icon: "🚀",
        data,
      });
    };

    // ── Objectif de campagne atteint ────────────────────────────────
    const onCampaignGoalReached = (data) => {
      const msg = `Objectif atteint pour la campagne "${data.titre}" !`;
      toast.success(msg);
      addNotification({
        type: "goal",
        title: "🏆 Objectif atteint !",
        message: msg,
        icon: "🏆",
        data,
      });
    };

    // ── Mise à jour du classement ───────────────────────────────────
    const onLeaderboardUpdate = (data) => {
      addNotification({
        type: "info",
        title: "Classement mis à jour",
        message: "Le classement des donateurs a été actualisé",
        icon: "📊",
        data: data || null,
      });
    };

    // Abonnement aux événements
    socket.on("donation_validated", onDonationValidated);
    socket.on("demande_updated", onDemandeUpdated);
    socket.on("campagne_updated", onCampagneUpdated);
    socket.on("demande_status_changed", onDemandeStatusChanged);
    socket.on("new_campaign", onNewCampaign);
    socket.on("campaign_goal_reached", onCampaignGoalReached);
    socket.on("leaderboard_update", onLeaderboardUpdate);

    // Désabonnement propre lors du changement de socket ou démontage
    return () => {
      socket.off("donation_validated", onDonationValidated);
      socket.off("demande_updated", onDemandeUpdated);
      socket.off("campagne_updated", onCampagneUpdated);
      socket.off("demande_status_changed", onDemandeStatusChanged);
      socket.off("new_campaign", onNewCampaign);
      socket.off("campaign_goal_reached", onCampaignGoalReached);
      socket.off("leaderboard_update", onLeaderboardUpdate);
    };
  }, [socket, addNotification]);

  return null;
};

export default NotificationListener;

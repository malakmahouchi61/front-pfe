import React, { useState, useEffect } from 'react';
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaHeart,
  FaDonate,
  FaUsers,
  FaBuilding,
  FaUser,
  FaGlobe,
  FaCalendarAlt,
  FaGift,
  FaChartLine,
} from 'react-icons/fa';
import './Classement.css';

const Classement = () => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('global');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [myPoints, setMyPoints] = useState(0);
  const [myRank, setMyRank] = useState(0);
  const [impactStats, setImpactStats] = useState({
    beneficiariesHelped: 0,
    totalDonations: 0,
    materialDonations: 0,
    completedMissions: 0,
  });

  const formatPoints = (points) => {
    if (points === undefined || points === null) return '0';
    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const getBadge = (points) => {
    if (points >= 500) return { name: 'Champion solidaire', icon: <FaTrophy />, color: '#FFD700' };
    if (points >= 100) return { name: 'Cœur généreux', icon: <FaHeart />, color: '#f57c00' };
    return { name: 'Étoile montante', icon: <FaStar />, color: '#10b981' };
  };

  const getProgressToFirst = (points) => {
    if (filteredUsers.length === 0) return 0;
    const maxPoints = filteredUsers[0]?.points || 0;
    if (maxPoints === 0) return 0;
    return (points / maxPoints) * 100;
  };

  useEffect(() => {
    const fetchClassement = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const url = `http://localhost:3000/classement?type=${filterType}&period=${filterPeriod}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        const data = await res.json();
        const normalizedUsers = data.map((user) => ({
          id_utilisateur: user.id_utilisateur || user.id,
          nom: user.nom || user.name || 'Utilisateur',
          prenom: user.prenom || user.firstName || '',
          points: user.points || 0,
          avatar: user.avatar || null,
          type_utilisateur: user.type_utilisateur || user.type || 'donateur',
        }));
        setFilteredUsers(normalizedUsers);
        if (currentUser?.id_utilisateur) {
          const index = normalizedUsers.findIndex((u) => u.id_utilisateur === currentUser.id_utilisateur);
          if (index !== -1) {
            setMyRank(index + 1);
            setMyPoints(normalizedUsers[index].points);
          } else setMyRank(0);
        }
      } catch (err) {
        console.error('Erreur classement:', err);
        setError('Impossible de charger le classement. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    fetchClassement();
  }, [filterType, filterPeriod, currentUser]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3000/stats/impact');
        if (!res.ok) { console.warn('Stats impact non disponibles'); return; }
        const data = await res.json();
        setImpactStats({
          beneficiariesHelped: data.beneficiariesHelped ?? data.beneficiaires_aides ?? 0,
          totalDonations: data.totalDonations ?? data.dons_totaux ?? 0,
          materialDonations: data.materialDonations ?? data.dons_materiels ?? 0,
          completedMissions: data.completedMissions ?? data.missions_accomplies ?? 0,
        });
      } catch (err) { console.error('Erreur chargement stats impact', err); }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:3000/users/me', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser({
            id_utilisateur: data.id_utilisateur || data.id,
            nom: data.nom || data.name || 'Utilisateur',
            prenom: data.prenom || data.firstName || '',
          });
          setMyPoints(data.points || 0);
        } else {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setCurrentUser({
              id_utilisateur: parsed.id_utilisateur || parsed.id,
              nom: parsed.nom || parsed.name || 'Utilisateur',
              prenom: parsed.prenom || parsed.firstName || '',
            });
            setMyPoints(parsed.points || 0);
          }
        }
      } catch (err) { console.error('Erreur récupération utilisateur', err); }
    };
    fetchCurrentUser();
  }, []);

  const getSuggestion = () => {
    if (myRank === 1) return "🏆 Bravo ! Tu es le champion de l'entraide. Continue d'inspirer !";
    if (myRank === 2 || myRank === 3) {
      const pointsToFirst = filteredUsers[0]?.points - myPoints;
      if (pointsToFirst > 0) return `🎯 Encore ${formatPoints(pointsToFirst)} points pour devenir numéro 1 !`;
    }
    if (myRank > 3 && myRank <= 10) {
      const pointsToThird = filteredUsers[2]?.points - myPoints;
      if (pointsToThird > 0) return `🔥 Encore ${formatPoints(pointsToThird)} points pour entrer dans le top 3 !`;
    }
    if (myRank === 0) return "🌟 Rejoins le classement en faisant un don ! Ta générosité sera récompensée.";
    return "🌟 Continue à faire des dons pour grimper dans le classement !";
  };

  const top3 = filteredUsers.slice(0, 3);
  const rest = filteredUsers.slice(3);

  if (loading) return <div className="classement-loading">Chargement du classement...</div>;
  if (error) return <div className="classement-error">{error}</div>;

  return (
    <div className="classement-modern">
      <div className="classement-container">
        <div className="classement-header"><h1>Classement Sanad</h1><p className="subtitle">Les cœurs généreux de notre communauté</p></div>
        <div className="impact-stats">
          <div className="stat-card"><FaUsers className="stat-icon" /><div className="stat-info"><span className="stat-value">{impactStats.beneficiariesHelped}</span><span className="stat-label">Bénéficiaires aidés</span></div></div>
          <div className="stat-card"><FaDonate className="stat-icon" /><div className="stat-info"><span className="stat-value">{formatPoints(impactStats.totalDonations)} DT</span><span className="stat-label">Dons totaux</span></div></div>
          <div className="stat-card"><FaGift className="stat-icon" /><div className="stat-info"><span className="stat-value">{impactStats.materialDonations}</span><span className="stat-label">Dons matériels</span></div></div>
          <div className="stat-card"><FaChartLine className="stat-icon" /><div className="stat-info"><span className="stat-value">{impactStats.completedMissions}</span><span className="stat-label">Missions accomplies</span></div></div>
        </div>
        <div className="badges-grid">
          <div className="badge-card etoile"><FaStar className="badge-icon" /><strong>Étoile montante</strong><span>0 – 100 pts</span></div>
          <div className="badge-card coeur"><FaHeart className="badge-icon" /><strong>Cœur généreux</strong><span>100 – 500 pts</span></div>
          <div className="badge-card champion"><FaTrophy className="badge-icon" /><strong>Champion solidaire</strong><span>500+ pts</span></div>
        </div>
        <div className="filters-top">
          <div className="filter-block"><div className="filter-header"><FaUsers className="filter-icon" /><span>Type d'utilisateur</span></div>
            <div className="filter-options">
              <button className={filterType === 'global' ? 'active' : ''} onClick={() => setFilterType('global')}><FaGlobe /> Global</button>
              <button className={filterType === 'donateurs' ? 'active' : ''} onClick={() => setFilterType('donateurs')}><FaUsers /> Donateurs</button>
              <button className={filterType === 'associations' ? 'active' : ''} onClick={() => setFilterType('associations')}><FaBuilding /> Associations</button>
              <button className={filterType === 'beneficiaires' ? 'active' : ''} onClick={() => setFilterType('beneficiaires')}><FaUser /> Bénéficiaires</button>
            </div>
          </div>
          <div className="filter-block"><div className="filter-header"><FaCalendarAlt className="filter-icon" /><span>Période</span></div>
            <div className="filter-options">
              <button className={filterPeriod === 'today' ? 'active' : ''} onClick={() => setFilterPeriod('today')}>Aujourd'hui</button>
              <button className={filterPeriod === 'week' ? 'active' : ''} onClick={() => setFilterPeriod('week')}>Cette semaine</button>
              <button className={filterPeriod === 'month' ? 'active' : ''} onClick={() => setFilterPeriod('month')}>Ce mois</button>
              <button className={filterPeriod === 'all' ? 'active' : ''} onClick={() => setFilterPeriod('all')}>Tout le temps</button>
            </div>
          </div>
        </div>
        <div className="podium">
          {top3[1] && (<div className="podium-card second"><div className="podium-rank"><FaMedal className="medal" /> 2</div><div className="podium-avatar">{top3[1].avatar ? <img src={`http://localhost:3000${top3[1].avatar}`} alt={top3[1].nom} /> : <FaUser />}</div><div className="podium-name">{top3[1].nom} {top3[1].prenom}</div><div className="podium-badge" style={{ backgroundColor: `${getBadge(top3[1].points).color}20`, color: getBadge(top3[1].points).color }}>{getBadge(top3[1].points).icon} {getBadge(top3[1].points).name}</div><div className="podium-points"><FaStar /> {formatPoints(top3[1].points)} pts</div></div>)}
          {top3[0] && (<div className="podium-card first"><div className="podium-rank"><FaTrophy className="trophy" /> 1</div><div className="podium-avatar">{top3[0].avatar ? <img src={`http://localhost:3000${top3[0].avatar}`} alt={top3[0].nom} /> : <FaUser />}</div><div className="podium-name">{top3[0].nom} {top3[0].prenom}</div><div className="podium-badge" style={{ backgroundColor: `${getBadge(top3[0].points).color}20`, color: getBadge(top3[0].points).color }}>{getBadge(top3[0].points).icon} {getBadge(top3[0].points).name}</div><div className="podium-points"><FaStar /> {formatPoints(top3[0].points)} pts</div></div>)}
          {top3[2] && (<div className="podium-card third"><div className="podium-rank"><FaMedal className="medal" /> 3</div><div className="podium-avatar">{top3[2].avatar ? <img src={`http://localhost:3000${top3[2].avatar}`} alt={top3[2].nom} /> : <FaUser />}</div><div className="podium-name">{top3[2].nom} {top3[2].prenom}</div><div className="podium-badge" style={{ backgroundColor: `${getBadge(top3[2].points).color}20`, color: getBadge(top3[2].points).color }}>{getBadge(top3[2].points).icon} {getBadge(top3[2].points).name}</div><div className="podium-points"><FaStar /> {formatPoints(top3[2].points)} pts</div></div>)}
        </div>
        <div className="ranking-list">
          {rest.map((user, idx) => {
            const rank = idx + 4;
            const badge = getBadge(user.points);
            const progress = getProgressToFirst(user.points);
            const isCurrentUser = currentUser && user.id_utilisateur === currentUser.id_utilisateur;
            return (
              <div key={user.id_utilisateur} className={`ranking-card ${isCurrentUser ? 'current-user' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="rank-number">#{rank}</div>
                <div className="ranking-avatar">{user.avatar ? <img src={`http://localhost:3000${user.avatar}`} alt={user.nom} /> : <FaUser />}</div>
                <div className="ranking-info"><div className="ranking-name">{user.nom} {user.prenom}</div><div className="ranking-badge" style={{ backgroundColor: `${badge.color}20`, color: badge.color }}>{badge.icon} {badge.name}</div></div>
                <div className="ranking-stats"><div className="points"><FaStar /> {formatPoints(user.points)} pts</div><div className="progress-container"><div className="progress-bar" style={{ width: `${progress}%` }} /></div></div>
              </div>
            );
          })}
        </div>
        {currentUser && (
          <div className="personal-rank">
            <div className="personal-rank-content">
              <div className="rank-icon">{myRank <= 3 ? <FaTrophy /> : <FaDonate />}</div>
              <div className="rank-info"><div className="rank-label">Ton classement</div><div className="rank-number-large">{myRank > 0 ? `#${myRank}` : 'Non classé'}</div></div>
              <div className="rank-details"><div className="rank-points"><FaStar /> {formatPoints(myPoints)} pts</div><div className="rank-badge" style={{ backgroundColor: `${getBadge(myPoints).color}20`, color: getBadge(myPoints).color }}>{getBadge(myPoints).icon} {getBadge(myPoints).name}</div></div>
            </div>
            <div className="rank-suggestion">{getSuggestion()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Classement;
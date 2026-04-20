const { query } = require('../config/database');

const getOverviewStats = async (req, res) => {
  const [fossils, users, studies, media] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM fossils WHERE deleted_at IS NULL', []),
    query('SELECT COUNT(*)::int AS count FROM users WHERE deleted_at IS NULL', []),
    query("SELECT COUNT(*)::int AS count FROM scientific_studies WHERE publication_status = 'published'", []),
    query('SELECT COUNT(*)::int AS count FROM media', []),
  ]);
  return res.json({
    success: true,
    data: {
      fossils: fossils.rows[0].count,
      users: users.rows[0].count,
      studies: studies.rows[0].count,
      media: media.rows[0].count,
    },
  });
};

const getFossilStats = async (req, res) => {
  const byStatus = await query('SELECT status, COUNT(*)::int AS total FROM fossils WHERE deleted_at IS NULL GROUP BY status ORDER BY status', []);
  return res.json({ success: true, data: byStatus.rows });
};

const getUserStats = async (req, res) => {
  const byRole = await query(
    `SELECT ur.role, COUNT(DISTINCT ur.user_id)::int AS total
     FROM user_roles ur
     JOIN users u ON u.id = ur.user_id AND u.deleted_at IS NULL
     GROUP BY ur.role
     ORDER BY ur.role`,
    []
  );
  return res.json({ success: true, data: byRole.rows });
};

const getCategoryStats = async (req, res) => {
  const byCategory = await query('SELECT category, COUNT(*)::int AS total FROM fossils WHERE deleted_at IS NULL GROUP BY category ORDER BY category', []);
  return res.json({ success: true, data: byCategory.rows });
};

const getTimelineStats = async (req, res) => {
  const timeline = await query(
    `SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*)::int AS total
     FROM fossils
     WHERE deleted_at IS NULL
     GROUP BY month
     ORDER BY month`,
    []
  );
  return res.json({ success: true, data: timeline.rows });
};

module.exports = { getOverviewStats, getFossilStats, getUserStats, getCategoryStats, getTimelineStats };

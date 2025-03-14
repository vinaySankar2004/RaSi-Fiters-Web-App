const User = require('./User');
const Member = require('./Member');
const Workout = require('./Workout');
const WorkoutLog = require('./WorkoutLog');

// User-Member association (one-to-one)
User.hasOne(Member, { foreignKey: 'user_id' });
Member.belongsTo(User, { foreignKey: 'user_id' });

// User-WorkoutLog association (one-to-many)
User.hasMany(WorkoutLog, { foreignKey: 'user_id' });
WorkoutLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    User,
    Member,
    Workout,
    WorkoutLog
};
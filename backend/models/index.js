const Member = require('./Member');
const Workout = require('./Workout');
const WorkoutLog = require('./WorkoutLog');

// Member-WorkoutLog association
Member.hasMany(WorkoutLog, { foreignKey: 'member_id' });
WorkoutLog.belongsTo(Member, { foreignKey: 'member_id' });

// Workout-WorkoutLog association
Workout.hasMany(WorkoutLog, { foreignKey: 'workout_name' });
WorkoutLog.belongsTo(Workout, { foreignKey: 'workout_name' });

module.exports = {
    Member,
    Workout,
    WorkoutLog
};

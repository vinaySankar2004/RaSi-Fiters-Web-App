const Member = require('./Member');
const Workout = require('./Workout');
const WorkoutLog = require('./WorkoutLog');
const Program = require('./Program');
const ProgramMembership = require('./ProgramMembership');
const DailyHealthLog = require('./DailyHealthLog');
const RefreshToken = require('./RefreshToken');

// Member-WorkoutLog association
Member.hasMany(WorkoutLog, { foreignKey: 'member_id' });
WorkoutLog.belongsTo(Member, { foreignKey: 'member_id' });

// Workout-WorkoutLog association
Workout.hasMany(WorkoutLog, { foreignKey: 'workout_name' });
WorkoutLog.belongsTo(Workout, { foreignKey: 'workout_name' });

// Program-Member association via ProgramMembership
Program.belongsToMany(Member, { through: ProgramMembership, foreignKey: 'program_id', otherKey: 'member_id' });
Member.belongsToMany(Program, { through: ProgramMembership, foreignKey: 'member_id', otherKey: 'program_id' });
ProgramMembership.belongsTo(Program, { foreignKey: 'program_id' });
ProgramMembership.belongsTo(Member, { foreignKey: 'member_id' });

// DailyHealthLog associations
Member.hasMany(DailyHealthLog, { foreignKey: 'member_id' });
DailyHealthLog.belongsTo(Member, { foreignKey: 'member_id' });
Program.hasMany(DailyHealthLog, { foreignKey: 'program_id' });
DailyHealthLog.belongsTo(Program, { foreignKey: 'program_id' });

// Refresh token associations
Member.hasMany(RefreshToken, { foreignKey: 'member_id' });
RefreshToken.belongsTo(Member, { foreignKey: 'member_id' });

module.exports = {
    Member,
    Workout,
    WorkoutLog,
    Program,
    ProgramMembership,
    DailyHealthLog,
    RefreshToken
};

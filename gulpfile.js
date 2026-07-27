const gulp = require('gulp');
const { execSync } = require('child_process');

const run = (cmd) => console.log(execSync(cmd).toString());

gulp.task('git:push', async function (cb) {
   if (process.env.TICKET) run(`git commit --amend --no-edit --trailer=TktNro:${process.env.TICKET}`);
   run('git push origin main --tags');
   cb();
});

gulp.task('git:add', async function (cb) {
   run('git add .');
   cb();
});

gulp.task('npm:patch', async function (cb) {
   run(`npm version patch -f -m "%s: ${process.env.MESSAGE}"`);
   cb();
});

gulp.task('npm:minor', async function (cb) {
   run(`npm version minor -f -m "%s: ${process.env.MESSAGE}"`);
   cb();
});

gulp.task('npm:major', async function (cb) {
   run(`npm version major -f -m "%s: ${process.env.MESSAGE}"`);
   cb();
});

gulp.task('patch', gulp.series('git:add', 'npm:patch', 'git:push'));
gulp.task('minor', gulp.series('git:add', 'npm:minor', 'git:push'));
gulp.task('major', gulp.series('git:add', 'npm:major', 'git:push'));

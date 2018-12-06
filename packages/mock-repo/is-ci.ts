import isCI from 'is-ci';

if (isCI) {
  process.exit(0);
} else {
  process.exit(1);
}

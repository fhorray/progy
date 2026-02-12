
import { createRouter } from '@nanostores/router';

export const $router = createRouter({
  home: '/',
  editor: '/studio',
  editorModule: '/studio/:moduleId',
  editorExercise: '/studio/:moduleId/:exerciseId',
  map: '/map',
  git: '/git',
  studio: '/studio',
});

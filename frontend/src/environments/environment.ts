import { DEBUG, URL } from './debug'

export const environment = {
  production: false,
  url: ''
};

if (DEBUG) {
  environment.production = false;
  environment.url = 'http://localhost:5000/api'
} else {
  environment.production = true;
  environment.url = URL
}

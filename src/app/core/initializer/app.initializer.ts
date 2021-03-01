import {AuthenticationService} from '../services/authentication.service';

// tslint:disable-next-line:typedef
export function appInitializer(authenticationService: AuthenticationService) {
  return () => {
    return new Promise((resolve) => {
      resolve();
      authenticationService.refreshToken().subscribe();
    });
  };
}

import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {VapidPublicKeyResult} from '../models/push-notifications/vapid-public-key-result';
import {SwPush} from '@angular/service-worker';
import {SubscriptionEndpoint} from '../models/push-notifications/subscription-endpoint';


@Injectable({
  providedIn: 'root'
})// @ts-ignore
export class PushNotificationsService {

  baseUrl = environment.apiUrl + 'push-subscriptions/';
  subscriptionSubject = new BehaviorSubject<PushSubscription>(null);
  private requestMode = false;
  private subscribed = false;

  constructor(private http: HttpClient,
              private swPush: SwPush) {
  }

  public subscribeNotifications(): void {
    if (!this.subscribed) {
      this.swPush.subscription.subscribe(sub => {
        this.subscribed = true;
        console.log(sub);

        if (sub && !this.requestMode) { // the same sub, please check user, change user in db
          this.createSubscription(sub).subscribe(() => {
            this.subscriptionSubject.next(sub);
          });
        }
      });
    }
  }

  public requestSubscription(): void {
    this.requestMode = true;
    if (!this.subscriptionSubject?.value) {
      this.getPublicKey().subscribe(keyRes => {
        this.swPush.requestSubscription({
          serverPublicKey: keyRes.key
        }).then(sub => {
          this.createSubscription(sub).subscribe(() => {
            this.subscriptionSubject.next(sub);
            this.requestMode = false;
          });
        }).catch(err => console.error('Could not subscribe to notifications', err));
      });
    }
  }

  public unsubscribeNotifications(): void {
    if (this.subscriptionSubject.value) {
      this.deleteSubscription(this.subscriptionSubject.value.endpoint)
        .subscribe(() => {
          this.swPush.unsubscribe().then(() => {
            this.subscriptionSubject.next(null);
          });
        });
    }
  }

  private createSubscription(subscription: PushSubscription): Observable<PushSubscription> {
    return this.http.post<PushSubscription>(this.baseUrl, subscription);
  }

  public deleteSubscription(endpoint): Observable<any> {
    return this.http.post(this.baseUrl + 'unsubscribe', new SubscriptionEndpoint(endpoint));
  }

  private getPublicKey(): Observable<VapidPublicKeyResult> {
    return this.http.post<VapidPublicKeyResult>(this.baseUrl + 'public-key', {});
  }
}

import { Component, OnInit } from '@angular/core';
import {User} from '../../../shared/models/user';
import {FormControl, FormGroup} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {VirtualScrollDataSource} from '../../../shared/models/virtual-scroll-data-source';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})// @ts-ignore
export class UsersComponent implements OnInit {

  dataSource: UserDataSource;
  nameFormControl = new FormControl();
  searchFormGroup: FormGroup;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.dataSource = new UserDataSource(this.userService);

    this.nameFormControl.valueChanges.subscribe(name => {
      this.dataSource = new UserDataSource(this.userService, name);
    });
    this.searchFormGroup = new FormGroup({name: this.nameFormControl});
  }
}

export class UserDataSource extends VirtualScrollDataSource<User> {

  constructor(private userService: UserService, private name?: string) {
    super(10);
    this._fetchPageData();
  }

  protected _fetchPageData(): void {
    this.loading = true;
    this.userService.getByName(this.cachedItems.length, this.pageSize, this.name).subscribe(res => {
      this.loading = false;
      console.log('loaded');
      this.cachedItems = this.cachedItems.concat(res);
      this.dataStream.next(this.cachedItems);
    }, () => {
      this.loading = false;
    });
  }
}

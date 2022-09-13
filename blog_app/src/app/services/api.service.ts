import { Injectable } from '@angular/core';
import { API, Auth } from 'aws-amplify';

const apiName = 'blogApi';
const apiPath = '/posts';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor() {}

  public async getAllPosts(): Promise<{}> {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const reqOptions = {
      Authorization: token,
    };
    var res = {};

    API.get(apiName, apiPath, reqOptions)
      .then((result) => {
        res = JSON.parse(result.body);
        // console.log('Result: ', res);
        return res;
      })
      .catch((err) => {
        console.log('Error: ', err);
        res = { error: err };
        return res;
      });

    return res;
  }

  public async createPost(postData: {}): Promise<void> {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const reqOptions = {
      Authorization: token,
      body: postData,
    };

    API.post(apiName, apiPath, reqOptions)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

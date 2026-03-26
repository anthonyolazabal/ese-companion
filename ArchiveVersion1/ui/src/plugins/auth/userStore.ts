import { defineStore } from 'pinia'

export const userStore = defineStore('user', {
    state: () => {
      return {
        username: null as UserInfo | null,
        password: null as UserInfo | null,
        token: null as UserInfo | null,
        authenticated: false
      }
    },
    actions: {
      getToken(){
        return this.token;
      },
      updateToken(tokenToUpdate){
        this.token = tokenToUpdate;
      },
      getUsername(){
        return this.username;
      },
      updateUsername(usernameToUpdate){
        this.username = usernameToUpdate;
      },
      updatePassword(passwordToUpdate){
        this.password = passwordToUpdate;
      },
      isAuthentifcated(){
        return this.authenticated;
      },
      updateIsAuthenticated(changeStatus){
        this.authenticated = changeStatus;
      }
    }
  })
  
  interface UserInfo {
    username: string,
    password: string,
    token: string,
    authenticated: boolean
  }
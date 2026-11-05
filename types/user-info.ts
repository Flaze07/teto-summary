export interface UserInfoData {
  _id: string;
  username: string;
}

export interface UserInfo {
  success: boolean;
  error: any | null;
  cache: any | null;
  data: UserInfoData;
}
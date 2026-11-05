import type { UserInfo, UserInfoData } from "../types/user-info";

export async function fetchUserInfo(query: string): Promise<UserInfoData | null> {
  const res = await fetch(`/.netlify/functions/fetch-user-info?query=${query}`);

  const respJson: UserInfo = await res.json();
  
  if (respJson.error) {
    return null;
  }

  return respJson.data;
}
import { appendFileSync, readFileSync } from 'fs';
import * as sdk from "matrix-js-sdk";// https://github.com/matrix-org/matrix-js-sdk
import { show } from "./utils.mjs"

export function setRoomList(matrixClient) {
    let roomList = matrixClient.getRooms();
    console.log('   setRoomList ' + show(roomList))
    roomList.sort(function (a, b) {
        // < 0 = a comes first (lower index) - we want high indexes = newer
        var aMsg = a.timeline[a.timeline.length - 1];
        if (!aMsg) {
            return -1;
        }
        var bMsg = b.timeline[b.timeline.length - 1];
        if (!bMsg) {
            return 1;
        }
        if (aMsg.getTs() > bMsg.getTs()) {
            return 1;
        } else if (aMsg.getTs() < bMsg.getTs()) {
            return -1;
        }
        return 0;
    });
    return roomList;
}

export async function getAndSaveClientData() {
    console.log("Device ID could not be found! Please enter your password below to generate one.")
    let tempClient = sdk.createClient({
      baseUrl: matrixBaseUrl,
      //accessToken: matrixAccessToken,
      //userId: matrixUserId,
    });
    let loginInfo = await tempClient.login(sdk.AuthType.Password, {
      user: matrixUserId,  // This can be example or @example:example.org
      password: await readlineSync.question("Password: ", { hideEchoBack: true, })  // This cannot be an access token
    })
    await tempClient.stopClient();
    console.log(loginInfo)
    
    let envContent = await readFileSync(".env", "utf-8");
    let data = "\nMATRIX_DEVICE_ID=" + loginInfo.device_id;
    
    if (!envContent.includes("MATRIX_ACCESS_TOKEN")) {
      data += "\nMATRIX_ACCESS_TOKEN=" + loginInfo.access_token;
      matrixAccessToken = loginInfo.access_token;
    }
    // Check if other data is also missing!
    /*
    const other_data = [
      ["MATRIX_USER_ID", loginInfo.user_id],
      ["MATRIX_ACCESS_TOKEN", loginInfo.access_token],
    ] 
    other_data.forEach((other_data_item) => {
      if (envContent.includes(data[0])) return;
      else {
        data += "\n" + other_data_item[0] + "=" + other_data_item[1];
      }
    })
    */
    console.log("To enable crypto, make sure to log into a trusted session and verify the following device: " + loginInfo.device_id)
    
  
    appendFileSync(".env", data)
    return loginInfo;
  
  }
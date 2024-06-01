import axios from "axios";


// const API_URL = 'https://datamate-api.onrender.com'
const API_URL = "http://localhost:8080";
class DatabaseService{
    async postDatabase(dbName:string, userid:string){
        return axios.post(`${API_URL}/postDB`,{
            "databaseName": dbName,
            "user":{
            "userId": userid,
            }
        }).then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        });
    }

    async getDBByNameAndUser(name: string,userid: number){
        return axios.get(`${API_URL}/getUserDBs?dbName=${name}&userId=${userid}`)
        .then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        })
    }

    async getDBsByUser(userid: string){
        return axios.get(`${API_URL}/getUserDBs/${userid}`)
        .then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        })
    }

    

}
export default new DatabaseService();
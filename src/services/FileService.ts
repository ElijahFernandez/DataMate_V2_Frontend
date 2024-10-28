import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

class FileService {

    //upload by user
    async uploadFile(file: File, userId: string) {
        let fd = new FormData();
        fd.append('file', file);
        fd.append('userId', userId.toString());
      
        // return axios.post("https://datamate-api.onrender.com/upload", fd, {
        // return axios.post("http://localhost:8080/upload", fd, {
            return axios.post(`${API_URL}/upload`, fd, {
            // what should be the api url for this?
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
          if (res.data) {
            return res.data;
          }
        }).catch(err => {
          console.log(err);
        });
      }
      

    async putFile(fileid:number, file:File, filename:string){
        let fd = new FormData();
        fd.append('file',file, filename)
        // return axios.put(`https://datamate-api.onrender.com/updateFile/${fileid}`, fd,{
        // return axios.put(`http://localhost:8080/updateFile/${fileid}`, fd,{
            return axios.put(`${API_URL}/updateFile/${fileid}`, fd,{
        headers:{
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((res)=>{
            if (res.data) {
                return res.data;
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    async getFile(fileid:number) {
        // return axios.get(`https://datamate-api.onrender.com/file?id=${fileid}`
        // return axios.get(`http://localhost:8080/file?id=${fileid}`
        return axios.get(`${API_URL}/file?id=${fileid}`

        ).then((res) => {
            if (res.data) {
                return res.data;
            }
        }).catch(err => {
            console.log(err);
        });
    }

    async getFiles() {
        // return axios.get('https://datamate-api.onrender.com:8080/files'
        // return axios.get('http://localhost:8080/files'
        return axios.get(`${API_URL}/files`

        ).then((res) => {
            console.log("All Files:", res.data);
            if (res.data) {
                return res.data;
            }
        }).catch(err => {
            console.log(err);
        });
    }

    async downloadFile(fileid:number){
        // return axios.get("https://datamate-api.onrender.com/downloadFile/" + fileid
        return axios.get(`${API_URL}/downloadFile/` + fileid

        ).then((res)=>{
            if(res.data){
                return res.data;
            }
        }).catch(err => {
            console.log(err);
        })
    }

    async deleteFile(fileId:number){
        // return axios.delete("https://datamate-api.onrender.com/deleteFile/" + fileId
        // return axios.delete("http://localhost:8080/deleteFile/" + fileId
        return axios.delete(`${API_URL}/deleteFile/` + fileId

        ).then((res) => {
            console.log(res.data);
            if (res.data) {
                return res.data;
            }
        }).catch(err => {
            console.log(err);
        });
    }

    async getReportsByUser(userid: string){
        return axios.get(`${API_URL}/getUserReports/${userid}`)
        .then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        })
    }
 
    async postReport(rprtName:string, rprtCode:string, userid:string){
        return axios.post(`${API_URL}/postReports`,{
            "reportName": rprtName,
            "reportCode": rprtCode,
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

    // async deletePost(postId:number){
    //     return axios.delete("http://localhost:8080/post/deletePost/"+postId
    //     ).then((res) => {
    //         console.log(res.data);
    //         if (res.data) {
    //             return res.data;
    //         }
    //     }).catch(err => {
    //         console.log(err);
    //     });
    // }
}
export default new FileService();
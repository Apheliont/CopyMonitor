require('dotenv').config({path: './variables.env'});
const path = require('path');
const fs = require('fs');

const express = require('express');
const sql = require('mssql');
const socketIO = require('socket.io');
const https = require('https');
const http = require('http');

// moment init
const moment = require('moment');
moment.locale('ru');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.port || 3000;
const vuePath = path.join(__dirname, '..', 'public');

const config = {
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_DBNAME,
  parseJSON: true
};

app.use(express.static(vuePath));
//---------------------------------------------

const connectionPool = new sql.ConnectionPool(config);

const dbQuery = `SELECT cq.PositionID, cq.ClipID, cq.GraphicID, cq.PathID, cp.Status, cp.Data,
   ISNULL(cp.WorkServer, cq.WorkComp) as Workstation,cq.Action,
   ISNULL(c.ClipName, g.GraphicName) as name,
   ISNULL(cex.ExternID, gex.ExtID) as ExtID,cp.TargetServer, cq.TargetServerID, ts.ServerName,cp.SourceServer, Servers.ServerName AS    SrcServerName,
   ISNULL(Paths.PathName, GraphicPaths.PathName) AS SrcPathName,cp.TargetFile,cp.SourceFile,cq.priority,cp.StartDate
  FROM CopyQueue AS cq WITH (NOLOCK)
  LEFT JOIN CopyProgress AS cp  WITH (NOLOCK) ON cp.PositionID = cq.PositionID  
  LEFT JOIN Clips AS c WITH (NOLOCK) ON c.ClipID = cq.ClipID 			
  LEFT JOIN Graphics AS g WITH (NOLOCK) ON g.GraphicID = cq.GraphicID  
  LEFT JOIN ExternalIDs AS cex WITH (NOLOCK) ON c.ClipID = cex.ClipID 		
  LEFT JOIN GraphExtIDs AS gex WITH (NOLOCK) ON g.GraphicID = gex.GraphicID  
  LEFT JOIN Servers ts WITH (NOLOCK) ON ts.ServerID = cq.TargetServerID  
  LEFT JOIN PathServerLinks AS psl WITH (NOLOCK) ON psl.PathID = cq.SourcePathClipID 		 
  LEFT JOIN GraphPathServerLinks AS gpsl WITH (NOLOCK) ON gpsl.GraphicPathID = cq.SourcePathGraphicID 		 
  LEFT JOIN Paths WITH (NOLOCK) ON Paths.PathID = cq.SourcePathClipID 		 
  LEFT JOIN GraphicPaths WITH (NOLOCK) ON GraphicPaths.GraphicPathID = cq.SourcePathGraphicID 		 
  LEFT JOIN Servers WITH (NOLOCK) ON Servers.ServerID = ISNULL(psl.ServerID, gpsl.ServerID) 
  ORDER BY cq.priority, cq.Pos`;


const fetcher = {
  connectedUserCounter: 0,
  userJoin() {
    this.connectedUserCounter += 1;
    if (this.connectedUserCounter === 1) {
      this.getDataFromDB();
    }
  },
  userLeft() {
    this.connectedUserCounter = this.connectedUserCounter - 1 >= 0 ? this.connectedUserCounter - 1 : 0;
  },
  getConnectedUsers() {
    return this.connectedUserCounter;
  },
  async getDataFromDB() {
    const pool = await connectionPool.connect();
    try {
      const request = await pool.request();

      const longPolling = () => {
        if (this.connectedUserCounter === 0) {
          pool.close();
          return false;
        }
        setTimeout(() => {
          request.query(dbQuery, (error, result) => {
            if (error) {
              console.log(`Query to DB failed: ${error}`);
            } else {
              io.emit('newData', result.recordset);
              longPolling();
            }
          })
        }, process.env.POOLING_INTERVAL);

      };
      longPolling(); //run longpolling
    } catch (err) {
      console.log(`SQL error omg: ${err}`);
    }
  }
};

const ipRegExp = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
io.on('connection', (socket) => {
  fetcher.userJoin();
  console.log(`${moment(Date.now()).format('DD/MM/YYYY HH:mm:ss')} New user connected (IP: ${ipRegExp.exec(socket.client.conn.remoteAddress)[0]}). Total: ${fetcher.getConnectedUsers()}`);


  socket.on('disconnect', () => {
    fetcher.userLeft();
    console.log(`${moment(Date.now()).format('DD/MM/YYYY HH:mm:ss')} User disconnected (IP: ${ipRegExp.exec(socket.client.conn.remoteAddress)[0]}). Total: ${fetcher.getConnectedUsers()}`);
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

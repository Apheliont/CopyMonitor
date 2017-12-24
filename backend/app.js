const express = require('express');
const sql = require('mssql');
const socketIO = require('socket.io');
const http = require('http');

const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.port || 3000;
const vuePath = path.join(__dirname, '..');

const config = {
  user: '***',
  password: '***',
  server: '***',
  database: '***',
  parseJSON: true
};

app.use(express.static(vuePath));
//---------------------------------------------

const fetchData = async function () {
  try {
      const connectionPool = await sql.connect(config);
      return await connectionPool.request()
      .query(`SELECT cq.PositionID, cq.ClipID, cq.GraphicID, cq.PathID, cp.Status, cp.Data,
   ISNULL(cp.WorkServer, cq.WorkComp) as Workstation,cq.Action,
   ISNULL(c.ClipName, g.GraphicName) as name,
   ISNULL(cex.ExternID, gex.ExtID) as ExtID,cp.TargetServer, cq.TargetServerID, ts.ServerName,cp.SourceServer, Servers.ServerName AS SrcServerName,
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
  ORDER BY cq.priority, cq.Pos`);
  } catch (err) {
    console.log(err);
  }
};


const longPooling = {
    connectedUserCounter: 0,
    isRunning: false,
    fetch: function fetch() {
      if (this.isRunning) {
        return false;
      }
      const fetchSome = () => {
        this.isRunning = true;
        fetchData().then(data => {
          io.emit('newData', data.recordset);
          sql.close();
          setTimeout(() => {
            if (this.connectedUserCounter === 0) {
              this.isRunning = false;
              return false;
            }
            fetchSome();
          }, 1000);
        });
      };
      fetchSome();
    }
};


io.on('connection', (socket) => {
  longPooling.connectedUserCounter++;
  console.log(`New user connected. Total: ${longPooling.connectedUserCounter}`);

  longPooling.fetch();


  socket.on('disconnect', () => {
    longPooling.connectedUserCounter--;
    console.log(`User disconnected. Total: ${longPooling.connectedUserCounter}`);

    if (longPooling.connectedUserCounter < 0) {
      // защита от ошибок с коннектом
      longPooling.connectedUserCounter = 0;
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

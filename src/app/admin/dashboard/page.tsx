"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [time, setTime] = useState("");
  useEffect(() => { setTime(new Date().toLocaleString("ja-JP")); }, []);

  const stats = [
    { val:24, ja:"選考中の人材", vn:"Ứng viên đang tuyển", sub:"↑ +3 今週", color:"#185FA5" },
    { val:12, ja:"内定済み",     vn:"Đã offer thành công", sub:"↑ +2 今月", color:"#27500A" },
    { val:8,  ja:"募集中求人",   vn:"Công việc đang tuyển", sub:"⚡ 2件緊急", color:"#633806" },
    { val:5,  ja:"未対応メッセージ", vn:"Tin nhắn chưa xử lý", sub:"● 本日新着", color:"#C8002A" },
  ];
  const pipeline = [
    { ja:"新規登録", vn:"Mới đăng ký", val:13, pct:65, color:"#378ADD" },
    { ja:"面接中",   vn:"Đang phỏng vấn", val:8, pct:40, color:"#EF9F27" },
    { ja:"内定済み", vn:"Đã offer",    val:6, pct:30, color:"#5DCAA5" },
    { ja:"就業中",   vn:"Đang làm việc", val:11, pct:55, color:"#27500A" },
    { ja:"退職",     vn:"Nghỉ việc",  val:3, pct:15, color:"#B4B2A9" },
  ];
  const jobs = [
    { ja:"飲食・レストラン", vn:"Nhà hàng",   val:6, pct:75, color:"#378ADD" },
    { ja:"製造・工場",       vn:"Nhà máy",    val:4, pct:50, color:"#5DCAA5" },
    { ja:"農業・農場",       vn:"Nông nghiệp",val:3, pct:37, color:"#EF9F27" },
    { ja:"ホテル",           vn:"Khách sạn",  val:2, pct:25, color:"#F09595" },
  ];
  const acts = [
    { time:"本日 09:12", ja:"Webからの新規問い合わせ", obj:"山本フーズ株式会社", vn:"Tin nhắn mới", tc:"#0C447C", tb:"#E6F1FB" },
    { time:"本日 08:45", ja:"候補者情報更新",           obj:"Nguyen Thi Lan",    vn:"Cập nhật CV", tc:"#633806", tb:"#FAEEDA" },
    { time:"昨日 16:30", ja:"内定承諾",                 obj:"Tran Van Duc",      vn:"Nhận offer",  tc:"#534AB7", tb:"#EEEDFE" },
    { time:"昨日 14:00", ja:"緊急求人追加",              obj:"東京工場株式会社",   vn:"Khẩn cấp",   tc:"#A32D2D", tb:"#FCEBEB" },
  ];
  const B = { border:"0.5px solid rgba(11,31,58,0.1)" };
  return (
    <div>
      <div style={{ background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:"14px",fontWeight:700,color:"#0B1F3A" }}>ダッシュボード / Dashboard</div>
          <div style={{ fontSize:"10px",color:"#6B6B6B" }}>{time}</div>
        </div>
        <Link href="/admin/jobs" style={{ padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"#0B1F3A",color:"#fff",textDecoration:"none" }}>+ 新規追加 / Thêm mới</Link>
      </div>
      <div style={{ padding:"16px 20px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"14px" }}>
          {stats.map(s => (
            <div key={s.ja} style={{ background:"#fff",...B,borderRadius:"10px",padding:"14px 16px" }}>
              <div style={{ fontSize:"28px",fontWeight:700,color:s.color }}>{s.val}</div>
              <div style={{ fontSize:"12px",fontWeight:600,color:"#0B1F3A",margin:"2px 0 1px" }}>{s.ja}</div>
              <div style={{ fontSize:"10px",color:"#6B6B6B" }}>{s.vn}</div>
              <div style={{ fontSize:"10px",color:s.color,marginTop:"3px" }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px" }}>
          {[
            { title:"人材パイプライン / Pipeline ứng viên", data:pipeline, href:"/admin/candidates" },
            { title:"業種別求人 / Công việc theo ngành",     data:jobs,     href:"/admin/jobs" },
          ].map(card => (
            <div key={card.title} style={{ background:"#fff",...B,borderRadius:"10px",overflow:"hidden" }}>
              <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ fontSize:"12px",fontWeight:700,color:"#0B1F3A" }}>{card.title}</div>
                <Link href={card.href} style={{ fontSize:"10px",color:"#185FA5",textDecoration:"none" }}>全件表示 →</Link>
              </div>
              <div style={{ padding:"14px 16px" }}>
                {card.data.map(p => (
                  <div key={p.ja} style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"9px" }}>
                    <div style={{ width:"100px",flexShrink:0 }}>
                      <div style={{ fontSize:"11px",color:"#0B1F3A",fontWeight:500 }}>{p.ja}</div>
                      <div style={{ fontSize:"9px",color:"#6B6B6B" }}>{p.vn}</div>
                    </div>
                    <div style={{ flex:1,height:"5px",background:"#F6F7F9",borderRadius:"3px",overflow:"hidden" }}>
                      <div style={{ width:`${p.pct}%`,height:"100%",background:p.color,borderRadius:"3px" }}/>
                    </div>
                    <span style={{ fontSize:"11px",fontWeight:700,color:"#0B1F3A",width:"20px",textAlign:"right" }}>{p.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"#fff",...B,borderRadius:"10px",overflow:"hidden" }}>
          <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)" }}>
            <div style={{ fontSize:"12px",fontWeight:700,color:"#0B1F3A" }}>最近のアクティビティ / Hoạt động gần đây</div>
          </div>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:"12px" }}>
            <thead><tr style={{ background:"#F6F7F9" }}>
              {["日時","内容 / Sự kiện","対象","ステータス"].map(h=>(
                <th key={h} style={{ padding:"8px 14px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {acts.map((a,i) => (
                <tr key={i} style={{ borderBottom:"0.5px solid rgba(11,31,58,0.05)" }}>
                  <td style={{ padding:"10px 14px",color:"#6B6B6B",fontSize:"10px",whiteSpace:"nowrap" }}>{a.time}</td>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ fontSize:"12px",color:"#0B1F3A" }}>{a.ja}</div>
                    <div style={{ fontSize:"10px",color:"#6B6B6B" }}>{a.vn}</div>
                  </td>
                  <td style={{ padding:"10px 14px",fontWeight:600,color:"#0B1F3A",fontSize:"12px" }}>{a.obj}</td>
                  <td style={{ padding:"10px 14px" }}>
                    <span style={{ background:a.tb,color:a.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px" }}>{a.vn}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
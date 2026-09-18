/* LATTICE Work — bản mẫu · NỘI DUNG TRỢ GIÚP THEO NGỮ CẢNH
 * Mỗi ngữ cảnh: title, intro, steps, tips, rules, suggest, faq [câu hỏi, từ khóa không dấu cách nhau bằng |, trả lời].
 * Trợ lý (app.js) tìm câu trả lời ở faq của ngữ cảnh trước, rồi mới tới các ý định chung dựng từ luật và dữ liệu.
 */
window.HELP = {
  overview: {
    icon: 'info', related: ['home', 'tasks', 'menu', 'matrix'],
    vi: {
      title: 'Làm quen LATTICE Work',
      intro: 'Không gian làm việc chung cho người và agent AI. Mọi việc có một người chủ trì; kết quả AI dừng ở Chờ duyệt cho tới khi người quyết.',
      steps: ['Cần tôi — những gì đang chờ chính bạn: duyệt, việc được giao, agent chưa chạy.', 'Việc — bảng chung bốn trạng thái: Chờ giao, Đang làm, Chờ duyệt, Xong.', 'Tin nhắn — kênh của đội và chat với agent bạn chủ trì.', 'Tiện ích — Đội, Agent, Luồng mẫu, Scope Ledger, Cài đặt.'],
      tips: ['Mọi thẻ có nút ··· (hoặc nhấn giữ, chuột phải) để mở menu hành động.', 'Hành động mờ kèm dòng đỏ là việc bạn chưa được phép — dòng đỏ nói lý do.', 'Biểu tượng trợ lý (bong bóng chat có tia sáng) ở mỗi màn hình mở hướng dẫn và chat với trợ lý cho đúng màn hình đó.'],
      rules: ['Việc giao cho agent luôn có một người chủ trì.', 'Chỉ người chủ trì duyệt được kết quả.', 'Agent không bao giờ gửi email ra ngoài, duyệt việc, xóa dữ liệu, sửa Scope Ledger.'],
      suggest: ['Vai trò của tôi làm được gì?', 'Menu ··· dùng thế nào?', 'Phím tắt'],
      faq: [
        ['Bản mẫu lưu dữ liệu ở đâu?', 'luu|du lieu o dau|mat du lieu|localstorage', 'Dữ liệu nằm trong trình duyệt bạn đang dùng. Mỗi người, mỗi trình duyệt thấy bản riêng. Muốn làm lại từ đầu: Tiện ích → Đặt lại dữ liệu mẫu.'],
        ['Agent và trợ lý có gọi AI thật không?', 'ai that|mo hinh|claude|mo phong|that khong|gpt', 'Chưa. Trong bản mẫu, kết quả agent và câu trả lời của trợ lý được dựng từ hướng dẫn, luật và dữ liệu có sẵn. Bản chạy thật sẽ gọi mô hình qua máy chủ — khóa API không bao giờ nằm ở trình duyệt.']
      ]
    },
    en: {
      title: 'Getting started',
      intro: 'One workspace for people and AI agents. Every task has a human owner; AI output waits in review until a person decides.',
      steps: ['Needs me — what is waiting on you: approvals, assigned work, agents not yet run.', 'Tasks — the shared board with four states: To assign, In progress, In review, Done.', 'Messages — team channels and chats with agents you own.', 'Apps — Team, Agents, Flows, Scope Ledger, Settings.'],
      tips: ['Every card has a ··· button (or press and hold, or right-click) for its actions.', 'Greyed actions with a red line are not allowed for you — the red line says why.', 'The assistant icon (a chat bubble with a spark) on each screen opens the guide and assistant for that screen.'],
      rules: ['A task given to an agent always has a human owner.', 'Only the owner can approve output.', 'Agents never send external email, approve work, delete data or edit the Scope Ledger.'],
      suggest: ['What can my role do?', 'How does the ··· menu work?', 'Keyboard shortcuts'],
      faq: [
        ['Where is the data stored?', 'stored|where|data|localstorage|lose', 'In the browser you are using. Each person and browser has its own copy. To start over: Apps → Reset demo data.'],
        ['Do agents and the assistant use real AI?', 'real ai|model|claude|simulated|gpt', 'Not yet. In the prototype, agent output and assistant answers are built from guides, rules and existing data. Production will call the model through a server — API keys never live in the browser.']
      ]
    }
  },

  menu: {
    icon: 'more', related: ['overview', 'task', 'conv'],
    vi: {
      title: 'Menu hành động',
      intro: 'Mọi đối tượng — việc, tin nhắn, agent, người, luồng — có một menu hành động riêng.',
      steps: ['Laptop: bấm ··· hoặc chuột phải lên thẻ.', 'Điện thoại: bấm ··· hoặc nhấn giữ thẻ nửa giây.', 'Hành động mờ kèm dòng đỏ: bạn chưa được phép, dòng đỏ nói vì sao.'],
      tips: ['Trên laptop dùng phím mũi tên để chọn, Enter để chạy, Esc để đóng.'],
      rules: [], suggest: ['Phím tắt', 'Vì sao có hành động bị mờ?'],
      faq: [['Vì sao có hành động bị mờ?', 'mo|bi mo|khoa|mau do|dong do', 'Hành động đó bị luật chặn với vai trò hoặc vị trí của bạn trong việc. Ứng dụng vẫn hiện để bạn biết nó tồn tại, và dòng đỏ ghi đúng lý do — ví dụ chỉ người chủ trì mới duyệt được.']]
    },
    en: {
      title: 'Action menus',
      intro: 'Every object — task, message, agent, person, flow — has its own action menu.',
      steps: ['Laptop: click ··· or right-click the card.', 'Phone: tap ··· or press and hold the card.', 'Greyed actions with a red line are not allowed for you; the line says why.'],
      tips: ['On a laptop use the arrow keys to move, Enter to run, Esc to close.'],
      rules: [], suggest: ['Keyboard shortcuts', 'Why are some actions greyed out?'],
      faq: [['Why are some actions greyed out?', 'grey|greyed|locked|red line|disabled', 'A rule blocks that action for your role or your position on the item. It stays visible so you know it exists, and the red line gives the exact reason — for example, only the owner can approve.']]
    }
  },

  login: {
    icon: 'user', related: ['signup', 'accept', 'outbox'],
    vi: {
      title: 'Đăng nhập', intro: 'Vào bằng mật khẩu hoặc bằng liên kết gửi tới email. Mỗi tổ chức là một không gian riêng; một email có thể thuộc nhiều tổ chức.',
      steps: ['Chọn Mật khẩu hoặc Liên kết email.', 'Mật khẩu: bấm một tài khoản mẫu để điền sẵn, rồi bấm Vào.', 'Liên kết email: nhập email, bấm Gửi, rồi mở Hộp thư mô phỏng và bấm Đăng nhập trong thư.', 'Email có tài khoản ở nhiều tổ chức thì chọn tổ chức muốn vào.'],
      tips: ['Mật khẩu mọi tài khoản mẫu: lattice.', 'Không có mật khẩu vẫn vào được bằng liên kết email.'],
      rules: ['Sai mật khẩu 5 lần thì khóa 15 phút.', 'Liên kết đăng nhập dùng 1 lần, hết hạn 15 phút, tối đa 5 lần/giờ.', 'Không tự đăng ký vào tổ chức người khác được — chỉ bằng lời mời.'],
      suggest: ['Nên thử tài khoản nào trước?', 'Quên mật khẩu thì sao?'],
      faq: [
        ['Nên thử tài khoản nào trước?', 'thu|tai khoan|nen|truoc', 'Lê Đặng Tuấn (Chủ tổ chức) để thấy đủ mọi thứ; rồi Phạm Thu Hà (khách mời) để thấy hệ thống ẩn và khóa thế nào.'],
        ['Quên mật khẩu thì sao?', 'quen|mat khau|reset', 'Dùng Liên kết email để vào, rồi đặt lại trong Hồ sơ → Mật khẩu.']
      ]
    },
    en: {
      title: 'Sign in', intro: 'Sign in with a password or a link sent to your email. Each organisation is a separate workspace; one email can belong to several.',
      steps: ['Pick Password or Email link.', 'Password: click a demo account to fill it in, then Sign in.', 'Email link: enter the email, send, then open the Simulated outbox and press Sign in in the email.', 'If the email belongs to several organisations, choose one.'],
      tips: ['Every demo password is: lattice.', 'No password? The email link still works.'],
      rules: ['5 wrong passwords lock the account for 15 minutes.', 'Sign-in links are single use, expire in 15 minutes, max 5 per hour.', 'Nobody can sign up into someone else’s organisation — invitation only.'],
      suggest: ['Which account should I try first?', 'Forgot my password?'],
      faq: [
        ['Which account should I try first?', 'try|account|first|which', 'Lê Đặng Tuấn (owner) to see everything; then Phạm Thu Hà (guest) to see how things are hidden and locked.'],
        ['Forgot my password?', 'forgot|password|reset', 'Use the email link to get in, then set a new one in Profile → Password.']
      ]
    }
  },

  home: {
    icon: 'home', related: ['approve', 'tasks', 'menu'],
    vi: {
      title: 'Cần tôi', intro: 'Trang đầu tiên mỗi ngày: chỉ hiện những gì cần chính bạn ra tay.',
      steps: ['Hàng biểu tượng trên cùng là lối tắt: tạo việc, chờ duyệt, hỏi agent, luồng, Ledger.', 'Bốn ô số liệu bấm được — mỗi ô mở đúng danh sách tương ứng.', 'Thẻ Chờ tôi duyệt: đọc tóm tắt kết quả rồi bấm Duyệt hoặc Trả lại.', 'Bên dưới: việc giao cho bạn, agent bạn chủ trì chưa chạy, việc chờ giao.'],
      tips: ['Nhấn giữ một dòng (điện thoại) hoặc chuột phải (laptop) để mở menu hành động.', 'Chuông có số đỏ = số việc đang chờ bạn duyệt.'],
      rules: ['Chỉ việc bạn là người chủ trì mới xuất hiện ở Chờ tôi duyệt.'],
      suggest: ['Việc nào đang chờ tôi duyệt?', 'Có việc nào quá hạn không?', 'Tải việc của tôi thế nào?'],
      faq: [['Vì sao một việc không hiện ở Chờ tôi duyệt?', 'khong hien|khong thay|thieu viec|mat viec', 'Chờ tôi duyệt chỉ gồm việc đang Chờ duyệt VÀ bạn là người chủ trì. Việc người khác chủ trì nằm ở mục Đang chờ người khác duyệt hoặc trên bảng Việc.']]
    },
    en: {
      title: 'Needs me', intro: 'Your first screen each day: only what needs your own hand.',
      steps: ['The icon row is a set of shortcuts: new task, review, ask an agent, flows, Ledger.', 'The four number tiles are clickable — each opens the matching list.', 'Awaiting-approval cards: read the output summary, then Approve or Send back.', 'Below: work assigned to you, agents you own not yet run, unassigned work.'],
      tips: ['Press and hold a row (phone) or right-click (laptop) for actions.', 'The bell’s red number is how many items await your approval.'],
      rules: ['Only tasks you own appear under Waiting for my approval.'],
      suggest: ['What is waiting for my approval?', 'Is anything overdue?', 'What is my workload?'],
      faq: [['Why is a task missing from my approvals?', 'missing|not showing|cannot see|where is', 'That list only holds tasks In review AND owned by you. Tasks owned by others appear under Waiting on someone else or on the Tasks board.']]
    }
  },

  approve: {
    icon: 'approve', related: ['task', 'return', 'forbid'],
    vi: {
      title: 'Duyệt kết quả', intro: 'Kết quả agent (và việc có cổng duyệt) dừng ở Chờ duyệt cho tới khi người chủ trì quyết.',
      steps: ['Mở thẻ, đọc kết quả — bấm Xem đủ nếu dài.', 'Đạt: bấm Duyệt → việc sang Xong, mạch trao đổi ghi ai duyệt, lúc nào.', 'Chưa đạt: bấm Trả lại và ghi lý do → việc về Đang làm.', 'Kết quả của A5 là bản nháp: duyệt xong, người vẫn tự gửi email.'],
      tips: ['Lý do trả lại nên cụ thể — người và agent làm lại đọc đúng dòng này.', 'Trên laptop có thể kéo thẻ từ Chờ duyệt sang Xong.'],
      rules: ['Chỉ người chủ trì duyệt được.', 'Agent không bao giờ tự duyệt — bị chặn ở tầng dữ liệu.', 'Trả lại bắt buộc có lý do.'],
      suggest: ['Vì sao tôi không duyệt được?', 'Duyệt xong có tự gửi email không?', 'Trả lại khác gì mở lại?'],
      faq: [
        ['Duyệt xong có tự gửi email không?', 'email|gui thu|tu gui|khach', 'Không. Ứng dụng không bao giờ tự gửi thư. Agent chỉ soạn bản nháp; người duyệt xong tự sao chép và gửi từ hộp thư của mình.'],
        ['Trả lại khác gì mở lại?', 'mo lai|khac gi|reopen', 'Trả lại dùng khi việc đang Chờ duyệt: bắt buộc ghi lý do, việc về Đang làm. Mở lại dùng khi việc đã Xong: chỉ người chủ trì hoặc chủ sở hữu làm được.']
      ]
    },
    en: {
      title: 'Approving output', intro: 'Agent output (and gated tasks) waits in review until the owner decides.',
      steps: ['Open the card and read the output — See all if it is long.', 'Good: Approve → Done, and the thread records who approved and when.', 'Not good: Send back with a reason → back to In progress.', 'A5 output is a draft: after approval a person still sends the email.'],
      tips: ['Make send-back reasons specific — the person or agent redoing it reads that line.', 'On a laptop you can drag a card from In review to Done.'],
      rules: ['Only the owner can approve.', 'Agents never approve their own work — blocked in the data layer.', 'Sending back requires a reason.'],
      suggest: ['Why can’t I approve?', 'Does approving send the email?', 'Send back vs reopen?'],
      faq: [
        ['Does approving send the email?', 'email|send|automatically|client', 'No. The app never sends mail. Agents only draft; after approval a person copies and sends it from their own mailbox.'],
        ['Send back vs reopen?', 'reopen|difference|send back', 'Send back is for tasks In review: a reason is required and the task returns to In progress. Reopen is for Done tasks: only the owner or the account owner can do it.']
      ]
    }
  },

  tasks: {
    icon: 'tasks', related: ['task', 'newtask', 'menu'],
    vi: {
      title: 'Bảng việc chung', intro: 'Người và agent chung một bảng, bốn trạng thái: Chờ giao → Đang làm → Chờ duyệt → Xong.',
      steps: ['Chọn trạng thái ở hàng nút tròn (điện thoại) hoặc xem đủ bốn cột (laptop).', 'Bấm tên việc để mở chi tiết; bấm ··· để mở menu hành động.', 'Biểu tượng phễu để lọc theo dự án, người/agent, hoặc chỉ việc của tôi.', 'Laptop: kéo thẻ sang cột khác để đổi trạng thái.'],
      tips: ['Viền đỏ bên trái thẻ = việc đang chờ người duyệt.', 'Nhãn Cổng duyệt: kể cả việc của người cũng phải qua duyệt.'],
      rules: ['Việc của agent không nhảy thẳng sang Xong khi agent còn bắt buộc duyệt.', 'Bạn chỉ thấy việc trong dự án được phép, việc giao cho bạn, hoặc bạn chủ trì.'],
      suggest: ['Vì sao không kéo được thẻ?', 'Lọc việc thế nào?', 'Việc nào quá hạn?'],
      faq: [
        ['Vì sao không kéo được thẻ?', 'keo|tha|drag', 'Chỉ kéo được việc bạn được sửa: việc giao cho bạn, bạn chủ trì, hoặc bạn quản lý dự án đó. Kéo sai quy trình (ví dụ việc agent nhảy thẳng sang Xong) bị luật chặn và báo lý do.'],
        ['Lọc việc thế nào?', 'loc|filter|chi viec', 'Bấm biểu tượng phễu: chọn dự án, người hoặc agent, hoặc Của tôi. Bộ lọc đang bật hiện thành nhãn dưới tiêu đề — bấm × để bỏ.']
      ]
    },
    en: {
      title: 'Shared board', intro: 'People and agents share one board with four states: To assign → In progress → In review → Done.',
      steps: ['Pick a state with the round buttons (phone) or see all four columns (laptop).', 'Click a title for details; click ··· for actions.', 'Use the filter icon for project, people/agents, or just mine.', 'Laptop: drag a card to another column to change its state.'],
      tips: ['A red left edge means the task is waiting for a person to review.', 'The Gate label means even human work must pass review.'],
      rules: ['Agent work cannot jump straight to Done while the agent requires review.', 'You only see tasks in your projects, assigned to you, or owned by you.'],
      suggest: ['Why can’t I drag a card?', 'How do I filter?', 'What is overdue?'],
      faq: [
        ['Why can’t I drag a card?', 'drag|drop|move', 'You can only drag tasks you may edit: assigned to you, owned by you, or in a project you manage. Invalid moves (like agent work jumping to Done) are blocked with the reason.'],
        ['How do I filter?', 'filter|only mine|project', 'Use the filter icon: project, people or agents, or Mine. Active filters show as labels under the title — tap × to clear.']
      ]
    }
  },

  task: {
    icon: 'eye', related: ['approve', 'agentScope', 'menu'],
    vi: {
      title: 'Chi tiết việc', intro: 'Mọi thứ về một việc ở một chỗ: người làm, người chủ trì, hạn, bối cảnh, kết quả agent và mạch trao đổi.',
      steps: ['Sửa Giao cho, Hạn, Dự án rồi bấm Lưu thay đổi.', 'Việc của agent: bấm Chạy — kết quả vào mạch trao đổi và thường sang Chờ duyệt.', 'Mở Bối cảnh gửi cho mô hình để xem agent đã được đọc những gì.', 'Viết vào ô cuối trang để trao đổi ngay trong việc.'],
      tips: ['Nút ··· trên cùng gom mọi hành động, kể cả hành động bạn chưa được phép kèm lý do.', 'Dòng Nguồn đưa bạn về đúng tin nhắn đã sinh ra việc.'],
      rules: ['Giao cho agent thì người chủ trì tự lấy từ phạm vi của agent.', 'Chỉ quản lý dự án trở lên đổi được người chủ trì và cổng duyệt.'],
      suggest: ['Tôi làm được gì với việc này?', 'Ai duyệt việc này?', 'Agent đã đọc những gì?'],
      faq: [['Agent đã đọc những gì?', 'da doc|boi canh|context|nhin thay gi', 'Mở kết quả agent → Bối cảnh gửi cho mô hình. Bối cảnh dựng theo phạm vi của người bấm Chạy: agent không thấy dự án người đó không được xem.']]
    },
    en: {
      title: 'Task details', intro: 'Everything about one task: assignee, owner, due date, context, agent output and thread.',
      steps: ['Edit Assignee, Due, Project, then Save changes.', 'Agent task: press Run — output lands in the thread and usually moves to review.', 'Open Context sent to the model to see what the agent read.', 'Write in the box at the bottom to discuss inside the task.'],
      tips: ['The ··· button at the top holds every action, including blocked ones with reasons.', 'The Source row takes you back to the message that created the task.'],
      rules: ['Assigning an agent takes the owner from the agent’s scope.', 'Only project managers and above can change the owner or the gate.'],
      suggest: ['What can I do with this task?', 'Who approves this task?', 'What did the agent read?'],
      faq: [['What did the agent read?', 'read|context|see', 'Open the agent output → Context sent to the model. Context is built from the scope of whoever pressed Run: the agent cannot see projects that person cannot see.']]
    }
  },

  newtask: {
    icon: 'plus', related: ['tasks', 'agents'],
    vi: {
      title: 'Tạo việc', intro: 'Một việc cần: nội dung, dự án, hạn, và người hoặc agent thực hiện.',
      steps: ['Viết nội dung việc như một kết quả cần đạt.', 'Chọn dự án — quyết định ai nhìn thấy việc.', 'Chọn người hoặc agent; để trống nếu chưa biết giao ai (Chờ giao).', 'Ghi bối cảnh: đường dẫn tài liệu, yêu cầu, tiêu chí xong.'],
      tips: ['Chọn agent thì người chủ trì tự điền theo agent.', 'Bật Cổng duyệt cho mốc quan trọng — kể cả người làm cũng phải qua duyệt.'],
      rules: ['Thành viên chỉ giao được cho chính mình hoặc cho agent.', 'Khách mời không tạo việc.'],
      suggest: ['Nên giao cho người hay agent?', 'Cổng duyệt là gì?', 'Vì sao tôi không chọn được người khác?'],
      faq: [
        ['Nên giao cho người hay agent?', 'nguoi hay agent|nen giao|chon ai', 'Giao agent khi việc lặp lại, đầu vào rõ, kết quả kiểm được (soạn nháp, đối chiếu, dự toán). Giao người khi cần quyết định, quan hệ, hoặc hành động không hoàn tác được như ký, gửi, chi tiền.'],
        ['Cổng duyệt là gì?', 'cong duyet|gate', 'Cổng duyệt buộc việc — kể cả việc của người — phải qua Chờ duyệt trước khi Xong. Dùng cho mốc như ký hợp đồng, bàn giao.']
      ]
    },
    en: {
      title: 'New task', intro: 'A task needs: what to achieve, a project, a due date, and a person or agent.',
      steps: ['Write the task as an outcome.', 'Pick the project — it decides who can see the task.', 'Pick a person or an agent; leave empty if unsure (To assign).', 'Add context: document links, requirements, definition of done.'],
      tips: ['Picking an agent fills in its owner automatically.', 'Turn on the Gate for milestones — even human work must pass review.'],
      rules: ['Members can only assign themselves or an agent.', 'Guests cannot create tasks.'],
      suggest: ['Person or agent?', 'What is a gate?', 'Why can’t I pick someone else?'],
      faq: [
        ['Person or agent?', 'person or agent|who should|assign to', 'Use an agent for repeatable work with clear input and checkable output (drafts, comparisons, estimates). Use a person for decisions, relationships, or irreversible actions like signing, sending or paying.'],
        ['What is a gate?', 'gate', 'A gate forces a task — even human work — through review before Done. Use it for milestones like signing or handover.']
      ]
    }
  },

  'return': {
    icon: 'undo', related: ['approve', 'task'],
    vi: {
      title: 'Trả lại việc', intro: 'Trả lại khi kết quả chưa đạt. Việc về Đang làm, lý do nằm lại trong mạch trao đổi.',
      steps: ['Ghi rõ thiếu gì hoặc sai ở đâu.', 'Nếu là agent: nói cần chạy lại với chỉ dẫn gì.', 'Bấm Trả lại.'],
      tips: ['Lý do tốt: “Thiếu mục đặt lịch khám, dẫn lại Ledger L4”. Lý do kém: “Chưa ổn”.'],
      rules: ['Bắt buộc có lý do.', 'Chỉ người chủ trì trả lại được.'],
      suggest: ['Viết lý do thế nào cho tốt?'],
      faq: [['Viết lý do thế nào cho tốt?', 'ly do|viet|the nao', 'Nói cụ thể ba điều: thiếu hoặc sai gì, căn cứ (mục Ledger, tài liệu), và mong muốn lần sau. Ví dụ: “Điểm lệch SEO chưa quy ra tiền — bổ sung hệ số rồi chạy lại”.']]
    },
    en: {
      title: 'Send back', intro: 'Send back when output is not good enough. The task returns to In progress and the reason stays in the thread.',
      steps: ['Say what is missing or wrong.', 'For an agent: say what to rerun with.', 'Press Send back.'],
      tips: ['Good: “Missing online booking, cite Ledger L4”. Poor: “Not right”.'],
      rules: ['A reason is required.', 'Only the owner can send back.'],
      suggest: ['How do I write a good reason?'],
      faq: [['How do I write a good reason?', 'reason|write|good', 'Say three things: what is missing or wrong, the basis (Ledger item, document), and what you expect next. Example: “SEO drift not priced — add a coefficient and rerun”.']]
    }
  },

  chat: {
    icon: 'chat', related: ['conv', 'agentchat'],
    vi: {
      title: 'Tin nhắn', intro: 'Kênh của đội và chat với agent ở chung một danh sách, mới nhất lên đầu.',
      steps: ['Gõ vào ô tìm để lọc theo tên kênh, agent hoặc nội dung.', 'Chọn Tất cả / Kênh / Agent để lọc nhanh.', 'Bấm một dòng để mở hội thoại; ··· hoặc nhấn giữ để xem thành viên, tạo việc.'],
      tips: ['Chỉ thấy kênh có tên bạn trong danh sách thành viên.', 'Chỉ chat được với agent bạn chủ trì (chủ sở hữu thấy tất cả).'],
      rules: [], suggest: ['Vì sao tôi không thấy một kênh?', 'Chuyển tin nhắn thành việc thế nào?'],
      faq: [['Vì sao tôi không thấy một kênh?', 'khong thay kenh|kenh bi an|an kenh', 'Danh sách thành viên của kênh cũng chính là quy tắc hiển thị. Chủ sở hữu thêm bạn vào kênh thì kênh mới hiện.']]
    },
    en: {
      title: 'Messages', intro: 'Team channels and agent chats in one list, newest first.',
      steps: ['Type in search to filter by channel, agent or text.', 'Use All / Channels / Agents to filter quickly.', 'Tap a row to open it; ··· or press and hold for members and tasks.'],
      tips: ['You only see channels that list you as a member.', 'You can only chat with agents you own (the owner sees all).'],
      rules: [], suggest: ['Why can’t I see a channel?', 'How do I turn a message into a task?'],
      faq: [['Why can’t I see a channel?', 'cannot see|missing channel|hidden', 'A channel’s member list is also its visibility rule. The owner adds you, then it appears.']]
    }
  },

  conv: {
    icon: 'hash', related: ['chat', 'newtask', 'menu'],
    vi: {
      title: 'Kênh', intro: 'Bàn bạc gắn với việc: mọi tin nhắn chuyển thành việc được bằng một thao tác.',
      steps: ['Nhấn giữ (điện thoại) hoặc chuột phải / ··· (laptop) trên tin nhắn.', 'Chọn Chuyển thành việc — tin gốc được giữ làm bối cảnh.', 'Tin đã thành việc có nhãn việc bên dưới, bấm để mở.'],
      tips: ['Không dán nguyên văn tài liệu khách vào kênh — để tài liệu gốc trên Drive, kênh chỉ giữ đường dẫn.'],
      rules: ['Khách mời đọc và nhắn được nhưng không tạo việc.'],
      suggest: ['Chuyển tin nhắn thành việc thế nào?', 'Ai thấy kênh này?'],
      faq: [['Ai thấy kênh này?', 'ai thay|thanh vien|member', 'Chỉ những người có tên trong danh sách thành viên. Mở ··· trên đầu kênh để xem; chủ sở hữu sửa được danh sách.']]
    },
    en: {
      title: 'Channel', intro: 'Talk that turns into work: any message becomes a task in one step.',
      steps: ['Press and hold (phone) or right-click / ··· (laptop) on a message.', 'Choose Turn into task — the original stays as context.', 'Messages that became tasks show a task label; tap to open.'],
      tips: ['Do not paste client documents into channels — keep originals on Drive and share links.'],
      rules: ['Guests can read and write but cannot create tasks.'],
      suggest: ['How do I turn a message into a task?', 'Who can see this channel?'],
      faq: [['Who can see this channel?', 'who can see|members|member', 'Only people on the member list. Open ··· at the top to see it; the owner can edit it.']]
    }
  },

  agentchat: {
    icon: 'bot', related: ['agentScope', 'forbid', 'chat'],
    vi: {
      title: 'Chat với agent', intro: 'Hỏi agent về việc, trạng thái, Scope Ledger — trong đúng phạm vi bạn được xem.',
      steps: ['Bấm một câu gợi ý hoặc tự gõ câu hỏi.', 'Mở Bối cảnh gửi cho mô hình dưới câu trả lời để xem agent đã đọc gì.', 'Nhấn giữ câu trả lời → Tạo việc từ câu trả lời.'],
      tips: ['Mỗi câu hỏi tính một lượt vào hạn mức ngày của agent.'],
      rules: ['Agent không suy đoán về thứ ngoài phạm vi và không tiết lộ có bao nhiêu thứ bị giấu.', 'Chỉ người chủ trì agent (và chủ sở hữu) chat được.'],
      suggest: ['Agent này thấy được gì?', 'Vì sao agent trả lời thiếu?'],
      faq: [['Vì sao agent trả lời thiếu?', 'tra loi thieu|khong biet|sai|thieu', 'Agent chỉ đọc dữ liệu trong phạm vi của bạn và trong quyền đọc của agent (việc, kênh, Ledger, Drive). Thiếu quyền đọc nào thì câu trả lời thiếu phần đó.']]
    },
    en: {
      title: 'Agent chat', intro: 'Ask an agent about tasks, status, the Scope Ledger — within exactly what you can see.',
      steps: ['Tap a suggestion or type your question.', 'Open Context sent to the model under an answer to see what it read.', 'Press and hold an answer → Create a task from this answer.'],
      tips: ['Each question uses one run of the agent’s daily limit.'],
      rules: ['Agents never guess beyond your scope or reveal how much is hidden.', 'Only the agent’s owner (and the account owner) can chat with it.'],
      suggest: ['What can this agent see?', 'Why is the answer incomplete?'],
      faq: [['Why is the answer incomplete?', 'incomplete|missing|wrong|does not know', 'The agent only reads data within your scope and its own read rights (tasks, channels, Ledger, Drive). A missing read right means a missing part of the answer.']]
    }
  },

  apps: {
    icon: 'apps', related: ['overview', 'people', 'agents'],
    vi: {
      title: 'Tiện ích', intro: 'Mọi công cụ quản trị trong một lưới biểu tượng. Ô nào hiện ra tùy vai trò của bạn.',
      steps: ['Đội ngũ: người, agent, tin nhắn.', 'Vận hành: luồng mẫu, Scope Ledger, bảng hệ số, chờ duyệt.', 'Hệ thống: kết nối và khóa, nhật ký, ma trận quyền.'],
      tips: ['Bấm ··· trên thẻ hồ sơ để sửa ảnh, giới thiệu, mật khẩu.'], rules: [],
      suggest: ['Vì sao tôi không thấy Cài đặt?', 'Đổi ngôn ngữ ở đâu?'],
      faq: [
        ['Vì sao tôi không thấy Cài đặt?', 'cai dat|settings|nhat ky|he so', 'Kết nối và khóa, Nhật ký và Bảng hệ số chỉ hiện với chủ sở hữu.'],
        ['Đổi ngôn ngữ ở đâu?', 'ngon ngu|english|tieng anh|tieng viet', 'Tiện ích → English / Tiếng Việt, hoặc nút EN / VI ở thanh bên trái trên laptop.']
      ]
    },
    en: {
      title: 'Apps', intro: 'Every admin tool in one icon grid. Which tiles appear depends on your role.',
      steps: ['Team: people, agents, messages.', 'Operations: flows, Scope Ledger, pricing, review.', 'System: connections and keys, activity log, permission matrix.'],
      tips: ['Use ··· on your profile card to change photo, bio or password.'], rules: [],
      suggest: ['Why can’t I see Settings?', 'Where do I change language?'],
      faq: [
        ['Why can’t I see Settings?', 'settings|log|pricing', 'Connections and keys, the activity log and pricing are owner-only.'],
        ['Where do I change language?', 'language|vietnamese|english', 'Apps → English / Tiếng Việt, or the EN / VI button in the left rail on a laptop.']
      ]
    }
  },

  people: {
    icon: 'users', related: ['matrix', 'agents'],
    vi: {
      title: 'Đội', intro: 'Mỗi người có một vai trò (làm được gì) và một phạm vi dự án (nhìn thấy gì) — hai trục tách rời.',
      steps: ['Xem vai trò, dự án được xem và tải việc của từng người.', 'Chủ sở hữu bấm ··· → Vai trò và phạm vi để đổi.', 'Bấm ··· → Việc đang giao cho người này để xem trên bảng.'],
      tips: ['Thanh tải đỏ = đang vượt công suất. Giao thêm sẽ có cảnh báo.'],
      rules: ['Phải còn ít nhất một chủ sở hữu.', 'Không hạ vai trò người đang chủ trì agent — đổi người chủ trì agent trước.'],
      suggest: ['Bốn vai trò khác nhau thế nào?', 'Công suất dùng để làm gì?'],
      faq: [['Công suất dùng để làm gì?', 'cong suat|capacity', 'Công suất là số việc mở tối đa một người nên giữ. AI thực thi ngay, con người xếp hàng — giao cho người đã chạm công suất thì ứng dụng hỏi lại trước.']]
    },
    en: {
      title: 'Team', intro: 'Each person has a role (what they can do) and a project scope (what they can see) — two separate axes.',
      steps: ['See each person’s role, visible projects and workload.', 'The owner uses ··· → Role and scope to change it.', 'Use ··· → Tasks assigned to this person to see them on the board.'],
      tips: ['A red load bar means over capacity; assigning more asks first.'],
      rules: ['At least one owner must remain.', 'Do not demote someone who owns agents — reassign the agents first.'],
      suggest: ['How do the four roles differ?', 'What is capacity for?'],
      faq: [['What is capacity for?', 'capacity', 'Capacity is the maximum open tasks a person should hold. AI runs instantly, people queue — assigning past capacity asks first.']]
    }
  },

  agents: {
    icon: 'bot', related: ['agentScope', 'forbid', 'agentchat'],
    vi: {
      title: 'Agent', intro: 'Với người, bạn cấp quyền hạn. Với agent, bạn đặt phạm vi: được đọc gì, được làm gì, ai chủ trì, có bắt buộc duyệt không.',
      steps: ['Mỗi thẻ cho biết người chủ trì, chế độ duyệt, quyền đọc và lượt chạy hôm nay.', 'Bấm Phạm vi và quyền để xem hoặc sửa (chủ sở hữu).', 'Bấm Nhắn cho agent để hỏi trong phạm vi của bạn.'],
      tips: ['Bắt buộc duyệt là mặc định. Chỉ tắt khi agent đã chứng minh đáng tin — kết quả khi đó vào thẳng Xong.'],
      rules: ['Agent không có vai trò.', 'Người chủ trì agent phải là chủ sở hữu hoặc quản lý dự án.'],
      suggest: ['Khi nào nên tắt bắt buộc duyệt?', 'Bốn điều cấm là gì?', 'Tôi chủ trì agent nào?'],
      faq: [['Khi nào nên tắt bắt buộc duyệt?', 'tat duyet|bat buoc duyet|tin cay', 'Khi việc lặp lại, rủi ro thấp, và phần lớn kết quả trước đó được duyệt không cần sửa (khung LATTICE gợi ý từ 60% trở lên). Việc có cổng duyệt vẫn luôn qua duyệt.']]
    },
    en: {
      title: 'Agents', intro: 'For people you grant permissions. For agents you set a scope: what they read, what they do, who owns them, whether review is required.',
      steps: ['Each card shows the owner, review mode, read rights and runs today.', 'Scope and rights to view or edit (owner).', 'Message agent to ask within your scope.'],
      tips: ['Review is on by default. Only switch it off once the agent has proven reliable — output then goes straight to Done.'],
      rules: ['Agents have no role.', 'An agent’s owner must be an owner or project manager.'],
      suggest: ['When should review be switched off?', 'What are the four prohibitions?', 'Which agents do I own?'],
      faq: [['When should review be switched off?', 'switch off|review required|trusted', 'When the work repeats, risk is low, and most past output was approved without edits (the LATTICE framework suggests 60% or more). Gated tasks are always reviewed.']]
    }
  },

  agentScope: {
    icon: 'shield', related: ['forbid', 'agents'],
    vi: {
      title: 'Phạm vi agent', intro: 'Bốn nhóm cấu hình được, bốn điều không bao giờ cấu hình được.',
      steps: ['Được đọc: nhiều bối cảnh hơn = hữu ích hơn nhưng rủi ro rò rỉ cao hơn.', 'Được làm: chỉ gồm hành động hoàn tác được.', 'Người chủ trì: bắt buộc, là người duyệt kết quả.', 'Hạn mức lượt/ngày: chặn chi phí chạy loạn.'],
      tips: ['Bấm Chạy thử bốn điều cấm để thấy luật chặn ở tầng dữ liệu.'],
      rules: ['Gửi email ra ngoài, duyệt việc, xóa dữ liệu, sửa Scope Ledger — không có ô tích.'],
      suggest: ['Agent này thấy được gì?', 'Vì sao không có ô tích cho điều cấm?', 'Nên cho agent đọc Drive không?'],
      faq: [
        ['Vì sao không có ô tích cho điều cấm?', 'o tich|checkbox|cau hinh', 'Vì đó là hành động không hoàn tác được. Nếu là ô tích, sẽ có ngày có người tích vào. Nên chúng là văn bản cố định và bị chặn ở tầng dữ liệu.'],
        ['Nên cho agent đọc Drive không?', 'drive|tai lieu', 'Chỉ khi agent cần tài liệu khách để làm việc (như A3 dò trôi phạm vi). Drive chỉ cho đường dẫn và trích đoạn, không giữ nguyên tệp.']
      ]
    },
    en: {
      title: 'Agent scope', intro: 'Four configurable groups, four things that are never configurable.',
      steps: ['Reads: more context is more useful but riskier.', 'Actions: reversible actions only.', 'Owner: required, the person who approves output.', 'Daily run limit: stops runaway cost.'],
      tips: ['Press Test the four prohibitions to see the data layer block them.'],
      rules: ['Sending external email, approving work, deleting data, editing the Scope Ledger — no checkbox.'],
      suggest: ['What can this agent see?', 'Why no checkbox for prohibitions?', 'Should the agent read Drive?'],
      faq: [
        ['Why no checkbox for prohibitions?', 'checkbox|configure|tick', 'They are irreversible. A checkbox would one day get ticked. So they are fixed text, enforced in the data layer.'],
        ['Should the agent read Drive?', 'drive|documents', 'Only if it needs client documents to work (like A3 scanning scope drift). Drive gives paths and excerpts only, never whole files.']
      ]
    }
  },

  forbid: {
    icon: 'lock', related: ['agentScope', 'approve'],
    vi: {
      title: 'Bốn điều cấm', intro: 'Không phải giới hạn quyền mà là giới hạn tính không thể hoàn tác.',
      steps: ['Gửi email ra ngoài — thư đã gửi không rút lại được.', 'Duyệt việc — agent tự duyệt thì mất dấu vết kiểm toán.', 'Xóa dữ liệu — không khôi phục được.', 'Sửa Scope Ledger — phá mốc chuẩn để dò trôi phạm vi.'],
      tips: ['Agent vẫn soạn thư hoàn chỉnh và chuẩn bị bản cập nhật Ledger. Chỉ thao tác cuối do người làm.'],
      rules: ['Chặn ở tầng dữ liệu, không chỉ ở giao diện.'],
      suggest: ['Chặn ở đâu?', 'Agent soạn email thì ai gửi?'],
      faq: [
        ['Chặn ở đâu?', 'chan o dau|lop|tang', 'Ở tầng dữ liệu, không phải giao diện. Trong bản mẫu là data.js; bản chạy thật là quyền cơ sở dữ liệu, và container agent không có thông tin gửi thư.'],
        ['Agent soạn email thì ai gửi?', 'ai gui|soan email|gui thu', 'Người chủ trì duyệt bản nháp, rồi tự gửi từ hộp thư của mình. Ứng dụng không bao giờ tự gửi.']
      ]
    },
    en: {
      title: 'Four prohibitions', intro: 'Not a permission limit — an irreversibility limit.',
      steps: ['External email — a sent email cannot be recalled.', 'Approving work — self-approval destroys the audit trail.', 'Deleting data — cannot be restored.', 'Editing the Scope Ledger — breaks the drift baseline.'],
      tips: ['Agents still write the full email and prepare the Ledger update. Only the final action is human.'],
      rules: ['Blocked in the data layer, not just the interface.'],
      suggest: ['Where is it blocked?', 'Who sends agent-drafted email?'],
      faq: [
        ['Where is it blocked?', 'where|layer|blocked', 'In the data layer, not the interface. In the prototype that is data.js; in production, database permissions, and the agent container has no mail credentials.'],
        ['Who sends agent-drafted email?', 'who sends|email|draft', 'The owner approves the draft, then sends it from their own mailbox. The app never sends.']
      ]
    }
  },

  flows: {
    icon: 'flow', related: ['flowEdit', 'tasks', 'projects'],
    vi: {
      title: 'Luồng mẫu', intro: 'Một luồng là chuỗi bước có thứ tự. Khởi chạy cho một dự án thì sinh toàn bộ việc cùng lúc. Luồng phải được Chủ tổ chức duyệt mới dùng được.',
      steps: ['Quản lý dự án hoặc Chủ tổ chức bấm + để soạn luồng mới.', 'Lưu nháp hoặc Lưu & gửi duyệt.', 'Chủ tổ chức duyệt (hoặc trả lại kèm lý do) — thấy ngay ở Cần tôi.', 'Luồng đã duyệt: bấm Khởi chạy, chọn dự án, ngày bắt đầu và người cho các bước của người.'],
      tips: ['Muốn sửa luồng đang dùng: Tạo phiên bản mới — bản cũ vẫn chạy đến khi bản mới được duyệt.', 'Bước có nhãn Cổng duyệt luôn phải qua duyệt, kể cả bước của người.'],
      rules: ['Chỉ luồng Đã duyệt mới khởi chạy được.', 'Chỉ người chủ trì dự án hoặc Chủ tổ chức khởi chạy, và chỉ chọn được người trong dự án.', 'Không tự duyệt luồng mình soạn khi còn Chủ tổ chức khác.'],
      suggest: ['Khởi chạy sinh ra những gì?', 'Sửa luồng đang dùng thế nào?'],
      faq: [
        ['Khởi chạy sinh ra những gì?', 'sinh ra|khoi chay tao|tao ra', 'Mỗi bước thành một việc: hạn = ngày bắt đầu + số ngày của bước, bước agent lấy người chủ trì của agent, bước người do bạn chọn và bạn chủ trì.'],
        ['Sửa luồng đang dùng thế nào?', 'sua|phien ban|version', 'Mở menu ··· của luồng → Tạo phiên bản mới. Sửa bản sao rồi gửi duyệt; khi được duyệt, bản cũ tự ngừng dùng.']
      ]
    },
    en: {
      title: 'Flows', intro: 'A flow is an ordered list of steps. Launching it for a project creates every task at once. A flow must be approved by an owner before use.',
      steps: ['A project manager or owner presses + to draft a flow.', 'Save as draft, or Save & submit.', 'The owner approves (or sends back with a reason) — it shows up in Needs me.', 'Approved flow: press Launch, choose project, start date and people for human steps.'],
      tips: ['To change a live flow: New version — the old one keeps running until the new one is approved.', 'Steps labelled Gate always require review, human steps included.'],
      rules: ['Only Approved flows can be launched.', 'Only the project lead or an owner launches, and only project members can be picked.', 'You cannot approve your own flow while another owner exists.'],
      suggest: ['What does launching create?', 'How do I change a live flow?'],
      faq: [
        ['What does launching create?', 'create|launch|generate', 'One task per step: due = start date + the step’s days; agent steps take the agent’s owner; human steps use the person you pick, owned by you.'],
        ['How do I change a live flow?', 'edit|change|version', 'Open the flow’s ··· menu → New version. Edit the copy and submit; once approved, the old one retires automatically.']
      ]
    }
  },

  ledger: {
    icon: 'book', related: ['forbid', 'rates'],
    vi: {
      title: 'Scope Ledger', intro: 'Mốc phạm vi đã chốt với khách. Mọi việc dò trôi phạm vi đối chiếu với đây.',
      steps: ['Chọn dự án để xem các hạng mục L1, L2…', 'Xem nhật ký quyết định: ai đổi, khi nào, căn cứ nào.', 'Quản lý dự án trở lên thêm hạng mục — bắt buộc ghi nguồn dẫn chiếu.'],
      tips: ['A3 Drift Guard quét tài liệu khách so với Ledger và quy điểm lệch ra ngày công, tiền.'],
      rules: ['Agent không bao giờ sửa Ledger.', 'Không có nguồn thì không cập nhật.'],
      suggest: ['Drift Guard dùng Ledger thế nào?', 'Vì sao phải ghi nguồn?'],
      faq: [
        ['Vì sao phải ghi nguồn?', 'nguon|dan chieu|source', 'Ledger đi thẳng vào phụ lục hợp đồng. Mỗi thay đổi phải truy được về biên bản, email hoặc tài liệu đã thống nhất.'],
        ['Drift Guard dùng Ledger thế nào?', 'drift|a3|lech|troi', 'A3 đối chiếu từng yêu cầu trong tài liệu khách với hạng mục Ledger, liệt kê điểm lệch, quy ra ngày công theo bảng hệ số, rồi quét ngược từ Ledger sang tài liệu.']
      ]
    },
    en: {
      title: 'Scope Ledger', intro: 'The scope baseline agreed with the client. Every drift check compares against it.',
      steps: ['Pick a project to see items L1, L2…', 'Read the decision log: who changed what, when, on what basis.', 'Project managers and above add items — a source is required.'],
      tips: ['A3 Drift Guard compares client documents with the Ledger and prices each gap in man-days and money.'],
      rules: ['Agents never edit the Ledger.', 'No source, no update.'],
      suggest: ['How does Drift Guard use the Ledger?', 'Why is a source required?'],
      faq: [
        ['Why is a source required?', 'source|reference|why', 'The Ledger goes straight into the contract annex. Every change must trace back to minutes, an email or an agreed document.'],
        ['How does Drift Guard use the Ledger?', 'drift|a3|gap', 'A3 matches each requirement in the client document to a Ledger item, lists gaps, prices them with the coefficient table, then scans back from Ledger to document.']
      ]
    }
  },

  rates: {
    icon: 'coin', related: ['ledger', 'agents'],
    vi: {
      title: 'Bảng hệ số định giá', intro: 'A3 và A4 chỉ dùng bảng này để quy hạng mục ra ngày công và tiền.',
      steps: ['Mỗi dòng: từ khóa, tên hạng mục, số ngày công.', 'Thêm hệ số mới ở biểu mẫu cuối trang.', 'Mở lại việc và chạy lại agent để dùng hệ số mới.'],
      tips: ['Hạng mục có số ở đầu (ví dụ “3 trang”) được nhân theo số lượng.'],
      rules: ['Thiếu hệ số thì agent dừng, không tự chế con số.'],
      suggest: ['Vì sao A4 dừng?'],
      faq: [['Vì sao A4 dừng?', 'dung|thieu he so|a4', 'Có hạng mục không khớp từ khóa nào trong bảng. Thêm hệ số cho hạng mục đó (ví dụ “đặt lịch”) rồi mở lại việc và chạy lại.']]
    },
    en: {
      title: 'Pricing coefficients', intro: 'A3 and A4 use only this table to turn items into man-days and money.',
      steps: ['Each row: keyword, item name, man-days.', 'Add a coefficient with the form at the bottom.', 'Reopen the task and rerun the agent to use it.'],
      tips: ['Items starting with a number (like “3 pages”) are multiplied.'],
      rules: ['Missing coefficient → the agent stops instead of inventing a number.'],
      suggest: ['Why did A4 stop?'],
      faq: [['Why did A4 stop?', 'stop|missing|a4', 'An item matched no keyword in the table. Add a coefficient for it (e.g. “booking”), reopen the task and rerun.']]
    }
  },

  settings: {
    icon: 'gear', related: ['forbid', 'log'],
    vi: {
      title: 'Kết nối và khóa', intro: 'Cấu hình mô hình AI, email, Drive, VPS, GitHub. Chỉ chủ sở hữu thấy.',
      steps: ['Sửa thông số từng thẻ rồi bấm Lưu.', 'Đặt khóa bí mật bằng nút Đặt khóa.', 'Sau khi đặt, chỉ còn ngày đặt — không đọc lại được giá trị.'],
      tips: ['Bản mẫu bỏ giá trị khóa ngay, không lưu ở đâu cả.'],
      rules: ['Ứng dụng không bao giờ tự gửi thư.', 'Token GitHub chỉ phạm vi repo, không bao giờ quyền quản trị.'],
      suggest: ['Vì sao không xem lại được khóa?'],
      faq: [['Vì sao không xem lại được khóa?', 'xem lai|khoa|key|token', 'Khóa chỉ ghi, không đọc — chuẩn của một kho khóa. Điều này cũng triệt tiêu thói quen sao chép khóa ra ngoài. Mất khóa thì đặt khóa mới.']]
    },
    en: {
      title: 'Connections and keys', intro: 'Configure the AI model, email, Drive, VPS, GitHub. Owner only.',
      steps: ['Edit each card and Save.', 'Set a secret with Set key.', 'Afterwards only the date remains — the value cannot be read back.'],
      tips: ['The prototype discards key values immediately.'],
      rules: ['The app never sends mail on its own.', 'GitHub tokens are repo-scoped, never admin.'],
      suggest: ['Why can’t I read a key back?'],
      faq: [['Why can’t I read a key back?', 'read back|key|token|see', 'Keys are write-only — the norm for a secret store. It also kills the habit of copying keys around. Lost it? Set a new one.']]
    }
  },

  log: {
    icon: 'log', related: ['settings'],
    vi: {
      title: 'Nhật ký hoạt động', intro: 'Mọi thay đổi đi qua tầng dữ liệu đều được ghi: ai, làm gì, trên đối tượng nào, khi nào.',
      steps: ['Đọc từ trên xuống: mới nhất trước.', 'Mã như task.update, agent.run cho biết loại thao tác.'],
      tips: ['Dùng khi cần trả lời “vì sao việc này đổi trạng thái”.'], rules: [],
      suggest: ['agent.run nghĩa là gì?'],
      faq: [['agent.run nghĩa là gì?', 'agent.run|ma hanh dong|task.update', 'agent.run là một lần chạy agent: ai bấm, việc nào, agent nào và trạng thái sau khi chạy. task.update là một lần sửa việc, kèm các trường đã đổi.']]
    },
    en: {
      title: 'Activity log', intro: 'Every change through the data layer is recorded: who, what, on which object, when.',
      steps: ['Newest first.', 'Codes like task.update or agent.run tell the kind of action.'],
      tips: ['Use it to answer “why did this task change state”.'], rules: [],
      suggest: ['What does agent.run mean?'],
      faq: [['What does agent.run mean?', 'agent.run|code|task.update', 'agent.run is one agent run: who pressed it, which task, which agent, and the resulting state. task.update is one task edit with the fields changed.']]
    }
  },

  projects: {
    icon: 'folder', related: ['invites', 'clock', 'people'],
    vi: {
      title: 'Dự án', intro: 'Mỗi dự án có một người chủ trì và danh sách thành viên. Ai không ở trong dự án thì không thấy việc của dự án đó.',
      steps: ['Chủ tổ chức bấm + để tạo dự án, chọn người chủ trì.', 'Người chủ trì mở Thành viên để thêm người đã có hoặc mời người mới.', 'Xong việc: Bàn giao — khách mời còn xem 30 ngày rồi tự hết quyền.', 'Kết thúc hẳn: Lưu trữ — chỉ còn xem.'],
      tips: ['Muốn thử hết hạn khách mời: Tiện ích → Tua ngày → +30 ngày.', 'Khách mời sắp hết hạn hiện ở Cần tôi; Chủ tổ chức gia hạn 30 ngày kèm lý do.'],
      rules: ['Hiện chỉ Chủ tổ chức tạo dự án.', 'Chủ trì phải là Chủ tổ chức hoặc Quản lý dự án.', 'Thêm khách mời (khách hàng) cần Chủ tổ chức.', 'Chỉ giao việc cho người trong dự án.'],
      suggest: ['Khách mời hết hạn thì sao?', 'Bỏ người khỏi dự án được không?'],
      faq: [
        ['Khách mời hết hạn thì sao?', 'het han|khach|guest', 'Họ không đăng nhập được nữa nếu không còn dự án nào khác. Lịch sử việc vẫn giữ. Chủ tổ chức có thể gia hạn.'],
        ['Bỏ người khỏi dự án được không?', 'bo|xoa|remove|thanh vien', 'Được, nếu người đó không còn việc mở trong dự án. Người chủ trì thì phải đổi chủ trì trước.']
      ]
    },
    en: {
      title: 'Projects', intro: 'Each project has a lead and a member list. People outside a project cannot see its work.',
      steps: ['The owner presses + to create a project and picks a lead.', 'The lead opens Members to add existing people or invite new ones.', 'Done: Hand over — guests keep access for 30 days, then lose it automatically.', 'Closed for good: Archive — read only.'],
      tips: ['To try guest expiry: Apps → Time travel → +30 days.', 'Guests about to expire show in Needs me; an owner can extend by 30 days with a reason.'],
      rules: ['For now only the owner creates projects.', 'The lead must be an owner or project manager.', 'Adding a guest (client) needs an owner.', 'Tasks can only be assigned to project members.'],
      suggest: ['What happens when a guest expires?', 'Can I remove someone?'],
      faq: [
        ['What happens when a guest expires?', 'expire|guest', 'They can no longer sign in unless another project keeps them. Their history stays. An owner can extend.'],
        ['Can I remove someone?', 'remove|member|delete', 'Yes, if they have no open tasks in the project. To remove the lead, change the lead first.']
      ]
    }
  },
  invites: {
    icon: 'mail', related: ['projects', 'accept', 'outbox'],
    vi: {
      title: 'Lời mời', intro: 'Người mới chỉ vào tổ chức bằng lời mời qua email. Lời mời dùng 1 lần, hết hạn sau 7 ngày.',
      steps: ['Bấm Mời người, nhập email, chọn vai trò và dự án.', 'Chủ tổ chức mời: thư gửi đi ngay. Quản lý dự án mời khách hàng: chờ Chủ tổ chức duyệt.', 'Người được mời bấm liên kết, đặt tên (và mật khẩu nếu muốn) là vào.'],
      tips: ['Trong bản mẫu, thư nằm ở Hộp thư mô phỏng — bấm Mở lời mời để thử vai người được mời.'],
      rules: ['Quản lý dự án chỉ mời Thành viên hoặc Khách mời vào dự án mình chủ trì.', 'Khách mời phải gắn với ít nhất một dự án.', 'Hệ thống chỉ lưu mã băm của liên kết, không lưu liên kết.'],
      suggest: ['Gửi nhầm thì sao?'],
      faq: [['Gửi nhầm thì sao?', 'nham|thu hoi|huy', 'Mở menu ··· của lời mời → Thu hồi. Liên kết hết hiệu lực ngay.']]
    },
    en: {
      title: 'Invitations', intro: 'New people only join by email invitation. Invitations are single use and expire after 7 days.',
      steps: ['Press Invite someone, enter the email, choose role and projects.', 'Owner invites go out at once. A project manager inviting a client waits for owner approval.', 'The invitee opens the link, sets a name (and optionally a password) and is in.'],
      tips: ['In the prototype, emails land in the Simulated outbox — press Open invitation to play the invitee.'],
      rules: ['Project managers invite only members or guests into projects they lead.', 'Guests must be attached to at least one project.', 'Only a hash of the link is stored, never the link itself.'],
      suggest: ['Sent it by mistake?'],
      faq: [['Sent it by mistake?', 'mistake|revoke|cancel', 'Open the invitation’s ··· menu → Revoke. The link stops working at once.']]
    }
  },
  accept: {
    icon: 'mail', related: ['login', 'invites'],
    vi: {
      title: 'Nhận lời mời', intro: 'Bạn được mời vào một tổ chức trên LATTICE Work.',
      steps: ['Kiểm tra tên tổ chức, người mời và vai trò.', 'Nhập tên của bạn.', 'Đặt mật khẩu nếu muốn (ít nhất 10 ký tự) — không đặt thì đăng nhập bằng liên kết email.', 'Bấm Nhận lời mời.'],
      tips: [], rules: ['Lời mời dùng 1 lần và hết hạn sau 7 ngày.'], suggest: [], faq: []
    },
    en: {
      title: 'Accept invitation', intro: 'You have been invited to an organisation on LATTICE Work.',
      steps: ['Check the organisation, who invited you and your role.', 'Enter your name.', 'Optionally set a password (10+ characters) — otherwise sign in with email links.', 'Press Accept invitation.'],
      tips: [], rules: ['Invitations are single use and expire after 7 days.'], suggest: [], faq: []
    }
  },
  signup: {
    icon: 'plus', related: ['login'],
    vi: {
      title: 'Tạo tổ chức mới', intro: 'Đăng ký công khai chỉ tạo một tổ chức mới, bạn là Chủ tổ chức. Mọi người khác vào bằng lời mời.',
      steps: ['Nhập email, tên và tên tổ chức.', 'Mở thư xác nhận (Hộp thư mô phỏng) và bấm Xác nhận tổ chức.', 'Tổ chức mới trống: tạo dự án, mời người.'],
      tips: ['Một email có thể là Chủ của nhiều tổ chức; chuyển qua lại trong menu tài khoản.'], rules: ['Liên kết xác nhận dùng 1 lần.'], suggest: [], faq: []
    },
    en: {
      title: 'New organisation', intro: 'Public sign-up only creates a new organisation, with you as owner. Everyone else joins by invitation.',
      steps: ['Enter your email, name and organisation name.', 'Open the confirmation email (Simulated outbox) and press Confirm organisation.', 'The new organisation is empty: create a project, invite people.'],
      tips: ['One email can own several organisations; switch in the account menu.'], rules: ['The confirmation link is single use.'], suggest: [], faq: []
    }
  },
  outbox: {
    icon: 'mail', related: ['invites', 'login'],
    vi: {
      title: 'Hộp thư mô phỏng', intro: 'Bản mẫu không gửi email thật. Mọi thư hệ thống — lời mời, liên kết đăng nhập, xác nhận tổ chức — nằm ở đây.',
      steps: ['Bấm nút trong thư để thử như đang mở email thật.'], tips: ['Bản chạy thật sẽ gửi qua máy chủ thư và không có trang này.'], rules: [], suggest: [], faq: []
    },
    en: {
      title: 'Simulated outbox', intro: 'The prototype sends no real email. Every system email — invitations, sign-in links, sign-up confirmations — lands here.',
      steps: ['Press the button inside an email to act as if you opened it.'], tips: ['Production sends through a mail server and has no such page.'], rules: [], suggest: [], faq: []
    }
  },
  clock: {
    icon: 'clock', related: ['projects'],
    vi: {
      title: 'Tua ngày', intro: 'Dời "hôm nay" của bản mẫu để thử những thứ phụ thuộc thời gian: khách mời hết hạn, việc trễ hạn.',
      steps: ['Bàn giao một dự án có khách mời.', 'Bấm +30 ngày.', 'Đăng xuất, thử đăng nhập bằng tài khoản khách mời — sẽ bị chặn.', 'Bấm Về ngày thật khi xong.'],
      tips: ['Khi đang tua, thanh đỏ ở đầu trang nhắc bạn.'], rules: ['Chỉ Chủ tổ chức; có ghi nhật ký.'], suggest: [], faq: []
    },
    en: {
      title: 'Time travel', intro: 'Shift the prototype’s "today" to test time-based rules: guest expiry, overdue work.',
      steps: ['Hand over a project that has a guest.', 'Press +30 days.', 'Sign out and try the guest account — it is blocked.', 'Press Back to today when done.'],
      tips: ['While shifted, a red bar at the top reminds you.'], rules: ['Owner only; logged.'], suggest: [], faq: []
    }
  },
  flowEdit: {
    icon: 'flow', related: ['flows'],
    vi: {
      title: 'Soạn luồng mẫu', intro: 'Mỗi dòng là một bước: tên, ai làm (người hoặc agent), bắt đầu sau bao nhiêu ngày, có cổng duyệt không.',
      steps: ['Đặt tên luồng.', 'Thêm bước, chọn người làm và số ngày +N.', 'Dùng ↑ ↓ để đổi thứ tự.', 'Lưu nháp hoặc Lưu & gửi duyệt.'],
      tips: ['Bước agent tự lấy người chủ trì của agent khi khởi chạy.'], rules: ['Luồng chỉ dùng được sau khi Chủ tổ chức duyệt.'], suggest: [], faq: []
    },
    en: {
      title: 'Edit flow template', intro: 'Each row is a step: name, who does it (a person or an agent), how many days after the start, and whether it is gated.',
      steps: ['Name the flow.', 'Add steps, pick the doer and +N days.', 'Use ↑ ↓ to reorder.', 'Save draft, or Save & submit.'],
      tips: ['Agent steps take the agent’s owner at launch.'], rules: ['A flow can only be used after an owner approves it.'], suggest: [], faq: []
    }
  },
  matrix: {
    icon: 'lock', related: ['people', 'overview'],
    vi: {
      title: 'Ma trận quyền', intro: 'Trục thứ nhất — quyền hạn: bốn vai trò, tám quyền. Trục thứ hai — phạm vi dự án — quyết định bạn nhìn thấy gì.',
      steps: ['Chủ sở hữu: toàn quyền, kể cả quản trị đội và phạm vi agent.', 'Quản lý dự án: giao việc, duyệt việc mình chủ trì, khởi chạy luồng.', 'Thành viên: tạo việc cho mình hoặc agent, chạy agent.', 'Khách mời: chỉ xem.'],
      tips: [], rules: [], suggest: ['Vai trò của tôi làm được gì?'], faq: []
    },
    en: {
      title: 'Permission matrix', intro: 'Axis one — permissions: four roles, eight rights. Axis two — project scope — decides what you see.',
      steps: ['Owner: everything, including team and agent scope.', 'Project manager: assign, approve own tasks, launch flows.', 'Member: create tasks for self or agents, run agents.', 'Guest: view only.'],
      tips: [], rules: [], suggest: ['What can my role do?'], faq: []
    }
  }
};

Object.assign(window.I18N, {
  'h.help': ['Trợ giúp', 'Help'],
  'h.helpTip': ['Hướng dẫn và trợ lý AI (phím H)', 'Guide and AI assistant (H)'],
  'h.guide': ['Hướng dẫn', 'Guide'],
  'h.ask': ['Hỏi trợ lý', 'Ask assistant'],
  'h.steps': ['Cách dùng', 'How it works'],
  'h.tips': ['Mẹo', 'Tips'],
  'h.rules': ['Luật cần biết', 'Rules to know'],
  'h.faq': ['Câu hỏi thường gặp', 'Common questions'],
  'h.related': ['Xem thêm', 'Related'],
  'h.askThis': ['Hỏi trợ lý về mục này', 'Ask about this'],
  'h.assistant': ['Trợ lý LATTICE', 'LATTICE assistant'],
  'h.hello': ['Chào {0}! Bạn đang ở “{1}”. Hỏi mình bất cứ điều gì về mục này — mình trả lời theo đúng vai trò và phạm vi của bạn.', 'Hi {0}! You are in “{1}”. Ask me anything about it — I answer for your role and scope.'],
  'h.helloAnon': ['Chào bạn! Bạn đang ở “{0}”. Hỏi mình bất cứ điều gì về mục này.', 'Hi! You are in “{0}”. Ask me anything about it.'],
  'h.sim': ['Bản mẫu: trợ lý trả lời từ hướng dẫn, luật và dữ liệu bạn được xem — chưa gọi mô hình AI thật.', 'Prototype: answers come from guides, rules and the data you can see — no real AI model yet.'],
  'h.ph': ['Hỏi về {0}…', 'Ask about {0}…'],
  'h.typing': ['Trợ lý đang soạn…', 'Assistant is typing…'],
  'h.aboutThis': ['Trợ giúp về mục này', 'Help with this'],
  'h.aboutThisS': ['Hướng dẫn và hỏi trợ lý', 'Guide and assistant'],
  'h.center': ['Trợ giúp', 'Help'],
  'h.centerS': ['Hướng dẫn, trợ lý AI', 'Guides, AI assistant'],
  'h.tipT': ['Mới dùng LATTICE Work?', 'New to LATTICE Work?'],
  'h.tipB': ['Bấm biểu tượng trợ lý (bong bóng chat có tia sáng) ở mỗi màn hình để xem hướng dẫn hoặc chat với trợ lý về đúng màn hình đó.', 'Tap the assistant icon (chat bubble with a spark) on any screen for its guide, or chat with the assistant about exactly that screen.'],
  'h.tipGo': ['Xem hướng dẫn', 'Open guide'],
  'h.tipX': ['Đã hiểu', 'Got it'],
  'h.clear': ['Bắt đầu lại', 'Start over'],
  'h.about': ['Về: {0}', 'About: {0}'],

  'a.fallback': ['Mình chưa có câu trả lời chắc chắn cho câu này trong bản mẫu. Bạn thử một câu gợi ý bên dưới, hoặc hỏi cụ thể hơn về việc, quyền, agent, luồng, Ledger.', 'I don’t have a reliable answer for that in the prototype. Try a suggestion below, or ask more specifically about tasks, permissions, agents, flows or the Ledger.'],
  'a.greet': ['Chào bạn! Mình giúp được gì trong “{0}”?', 'Hi! How can I help with “{0}”?'],
  'a.can': ['Với “{0}”, bạn làm được:', 'With “{0}” you can:'],
  'a.cannot': ['Chưa làm được:', 'Not available to you:'],
  'a.whyOwner': ['Chỉ người chủ trì duyệt được, vì AI không chịu trách nhiệm được — mỗi kết quả cần một người đứng tên.', 'Only the owner can approve, because AI cannot be accountable — every output needs a named person.'],
  'a.review.none': ['Không có việc nào đang chờ bạn duyệt.', 'Nothing is waiting for your approval.'],
  'a.review.list': ['Có {0} việc đang chờ bạn duyệt:', 'Waiting for your approval ({0}):'],
  'a.review.task': ['Việc này do {0} chủ trì — chỉ {0} duyệt được.', 'This task is owned by {0} — only {0} can approve it.'],
  'a.review.you': ['Đó là bạn. {0}', 'That is you. {0}'],
  'a.review.youNow': ['Việc đang Chờ duyệt: mở ra rồi bấm Duyệt hoặc Trả lại.', 'It is in review: open it, then Approve or Send back.'],
  'a.review.youLater': ['Khi việc sang Chờ duyệt, nó sẽ hiện ở Cần tôi.', 'When it reaches review it will appear under Needs me.'],
  'a.review.notYou': ['Bạn không phải người chủ trì nên không duyệt được.', 'You are not the owner, so you cannot approve it.'],
  'a.late.none': ['Trong phạm vi bạn được xem, không có việc nào quá hạn.', 'Nothing is overdue within your scope.'],
  'a.late.list': ['Trong phạm vi bạn được xem có {0} việc quá hạn:', 'Overdue within your scope ({0}):'],
  'a.role': ['Bạn là {0}. Vai trò này:', 'You are {0}. This role:'],
  'a.role.proj': ['Dự án bạn nhìn thấy: {0}.', 'Projects you can see: {0}.'],
  'a.forbid': ['Bốn điều agent không bao giờ làm — văn bản cố định, chặn ở tầng dữ liệu:', 'Four things agents never do — fixed text, blocked in the data layer:'],
  'a.scope.one': ['{0} được đọc: {1}.\nĐược làm: {2}.\nNgười chủ trì: {3}.\n{4}.\nHôm nay đã chạy {5}/{6} lượt.', '{0} reads: {1}.\nActions: {2}.\nOwner: {3}.\n{4}.\nRuns today: {5}/{6}.'],
  'a.scope.rv': ['Kết quả bắt buộc qua duyệt', 'Output must be reviewed'],
  'a.scope.direct': ['Kết quả đi thẳng sang Xong', 'Output goes straight to Done'],
  'a.scope.mine': ['Agent bạn chủ trì:', 'Agents you own:'],
  'a.scope.noneMine': ['Bạn chưa chủ trì agent nào. Chỉ chủ sở hữu và quản lý dự án chủ trì được agent.', 'You own no agents. Only owners and project managers can own agents.'],
  'a.create': ['Tạo việc: bấm nút + (giữa thanh dưới trên điện thoại, nút đỏ ở thanh bên trên laptop) hoặc phím N. Điền nội dung, dự án, hạn, rồi chọn người hoặc agent — chọn agent thì người chủ trì tự điền.', 'Create a task: tap + (centre of the bottom bar on a phone, the red button in the rail on a laptop) or press N. Fill in the task, project and due date, then pick a person or agent — picking an agent sets its owner automatically.'],
  'a.create.no': ['Vai trò của bạn không tạo được việc.', 'Your role cannot create tasks.'],
  'a.create.mem': ['Là thành viên, bạn chỉ giao được cho chính mình hoặc cho agent.', 'As a member you can only assign yourself or an agent.'],
  'a.flows': ['Luồng mẫu sinh đủ việc cho một dự án trong một lần khởi chạy.', 'A flow creates every task for a project in one launch.'],
  'a.flows.can': ['Bạn khởi chạy được: Tiện ích → Luồng mẫu → Khởi chạy.', 'You can launch: Apps → Flows → Launch.'],
  'a.flows.cannot': ['Vai trò của bạn không khởi chạy được — nhờ chủ sở hữu hoặc quản lý dự án.', 'Your role cannot launch — ask an owner or project manager.'],
  'a.ledger': ['Scope Ledger là mốc phạm vi đã chốt với khách; Drift Guard đối chiếu tài liệu khách với nó.', 'The Scope Ledger is the scope baseline agreed with the client; Drift Guard compares client documents with it.'],
  'a.ledger.can': ['Bạn cập nhật được — bắt buộc ghi nguồn.', 'You can update it — a source is required.'],
  'a.ledger.cannot': ['Bạn chỉ xem được.', 'You can only view it.'],
  'a.keys': ['Phím tắt trên laptop:\n· N — tạo việc mới\n· 1 2 3 4 — Cần tôi, Việc, Tin nhắn, Tiện ích\n· H — trợ giúp và trợ lý cho màn hình hiện tại\n· Esc — đóng menu, hộp thoại, trang chi tiết\n· Chuột phải — menu hành động\n· Enter — gửi tin nhắn (Shift+Enter xuống dòng)', 'Laptop shortcuts:\n· N — new task\n· 1 2 3 4 — Needs me, Tasks, Messages, Apps\n· H — help and assistant for the current screen\n· Esc — close menus, dialogs, details\n· Right-click — action menu\n· Enter — send a message (Shift+Enter for a new line)'],
  'a.menu': ['Mỗi thẻ có nút ···. Laptop: bấm ··· hoặc chuột phải. Điện thoại: bấm ··· hoặc nhấn giữ nửa giây. Hành động mờ kèm dòng đỏ là bạn chưa được phép — dòng đỏ ghi lý do.', 'Every card has a ··· button. Laptop: click ··· or right-click. Phone: tap ··· or press and hold. Greyed actions with a red line are not allowed for you — the line says why.'],
  'a.msgTask': ['Trong kênh, nhấn giữ (điện thoại) hoặc chuột phải / ··· (laptop) trên tin nhắn → Chuyển thành việc. Tin gốc được giữ làm bối cảnh và tin nhắn hiện nhãn việc để mở lại.', 'In a channel, press and hold (phone) or right-click / ··· (laptop) on a message → Turn into task. The original stays as context and the message shows a task label.'],
  'a.load': ['Bạn đang có {0}/{1} việc mở.', 'You have {0}/{1} open tasks.'],
  'a.load.team': ['Tải của đội:', 'Team load:'],
  'a.go.review': ['Đi tới Chờ duyệt', 'Go to review'],
  'a.go.open': ['Mở: {0}', 'Open: {0}'],
  'a.go.new': ['Tạo việc mới', 'New task'],
  'a.go.flows': ['Mở Luồng mẫu', 'Open flows'],
  'a.go.ledger': ['Mở Scope Ledger', 'Open Scope Ledger'],
  'a.go.agents': ['Mở danh sách agent', 'Open agents'],
  'a.go.matrix': ['Xem ma trận quyền', 'See permission matrix'],
  'a.go.chat': ['Mở Tin nhắn', 'Open messages'],
  'a.go.menu': ['Xem hướng dẫn menu', 'Menu guide']
});

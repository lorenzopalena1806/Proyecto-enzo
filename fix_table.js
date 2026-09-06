const fs = require('fs');
let code = fs.readFileSync('app/dashboard/history/page.tsx', 'utf8');

// The file currently has:
//           <MerchantChart data={chartData} />
//         </div>
//       </div>
//     </div>
//
//     {/* Lista interactiva */}
//     <HistoryTableClient txList={txList} />
//   </div>
// );

code = code.replace(
  /<\/div>\s*<\/div>\s*\{\/\* Lista interactiva \*\/}\s*<HistoryTableClient txList=\{txList\} \/>\s*<\/div>\s*\);\s*}/m,
  `          {/* Lista interactiva */}
          <HistoryTableClient txList={txList} />
        </div>
      </div>
    </div>
  );
}`
);

fs.writeFileSync('app/dashboard/history/page.tsx', code);
console.log('Fixed history table blur via regex.');

import fetch from "node-fetch";

const ledgerName = "test/test";

function delay(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
}

async function run() {
  //create a ledger
  const newLedgerResults = await fetch("http://localhost:8090/fdb/new-ledger", {
    method: "POST",
    body: JSON.stringify({ "ledger/id": ledgerName }),
  });

  await delay(1000);

  //add schema
  const schema = [
    {
      _id: "_collection",
      name: "test",
    },
    {
      _id: "_predicate",
      name: "test/description",
      type: "string",
    },
    {
      _id: "_predicate",
      name: "test/count",
      type: "int",
    },
  ];

  const addSchemaResults = await fetch(
    `http://localhost:8090/fdb/${ledgerName}/transact`,
    {
      method: "POST",
      body: JSON.stringify(schema),
    }
  );
  await delay(1000);

  //add data
  const data = [
    {
      _id: "test$first",
      "test/description": "first test",
      "test/count": 0,
    },
    {
      _id: "test$second",
      "test/description": "second test",
      "test/count": 1,
    },
    {
      _id: "test$third",
      "test/description": "third test",
      "test/count": 2,
    },
  ];

  const transactResults = await fetch(
    `http://localhost:8090/fdb/${ledgerName}/transact`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  await delay(1000);

  //query data
  const query = {
    where: [
      ["?t", "test/description", "?description"],
      ["?t", "test/count", "?count"],
    ],
    select: { "?t": ["description", "count"] },
    opts: {
      orderBy: ["DESC", "?count"],
    },
  };
  const results = await fetch(`http://localhost:8090/fdb/${ledgerName}/query`, {
    method: "POST",
    body: JSON.stringify(query),
  });

  console.log("status: ", results.status);
  console.log(await results.json());
  if (results.status === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run();

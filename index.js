const inquirer = require('inquirer')
const chalk = require('chalk').default;
const fs = require('fs');
const { devNull } = require('os');

console.log("Account initialized!")

Operation()

function Operation(){
    inquirer
    .prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an operation: ',
            choices:[
                'Create account', 
                'Check account balance', 
                'Deposit', 
                'Withdraw', 
                'Leave'
            ],
        },
    ])
    .then((answer) => {
        const action = answer['action']
        console.log(chalk.bgBlackBright(action))

        if(action === 'Create account'){
            createAccount()
        }else if(action === 'Check account balance'){
            accountBalance()
        }else if(action === 'Deposit'){
            Deposit()

        }else if(action === 'Withdraw'){
            withdraw()

        }else if(action ===  'Leave'){
            console.log(chalk.bgBlue.white.bold('Thanks for using our service!'))
            process.exit() 
        }
    })
    .catch(err => console.log(err))
}

function createAccount(){
    console.log(chalk.bgMagentaBright.black.bold('Congratulations on creating your account!'))
    console.log(chalk.magenta.bold('Set your account preferences: '))
    buildAccount()
}

function buildAccount(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Enter your account name: '
        }
    ]).then(answer => {
        const accountName = answer['accountName']
        console.info(accountName)
        if(!fs.existsSync('accounts')){ 
            fs.mkdirSync('accounts')
        }
        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.red.bold('This account already exists. Choose another name.'))
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err){console.log(err)})
        
        console.log(chalk.green.bold('Congratulations! Your account was successfully created!'))
        Operation()
    }).catch(err => console.log(err))
}

function accountBalance(){
    inquirer.prompt([{
            name: 'accountName',
            message: 'Enter your account name:'
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return accountBalance()
        } 
        const accountData = getAccount(accountName)
        console.log(chalk.bgYellow.black.bold(`Your account balance is: R$${accountData.balance}`))
        Operation()
    }).catch(err => console.log(err))
}

function Deposit(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'What is the name on your account?'
        }    
    ]).then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){ 
            return Deposit()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'How much would you like to deposit?'
            },
        ]).then((answer) => {
            const amount = answer['amount']
            addAmount(accountName, amount)
            Operation()
        }).catch(err => console.log(err))

    }).catch(err => console.log(err))
}

function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.white.bold('This account does not exist. Please try again.'))
        return false
    }
    return true
}

function addAmount(accountName, amount){
    const accountData = getAccount(accountName)
    if(!amount){
        console.log(chalk.bgRed.white.bold('ERROR! Please try again.'))
        return Deposit()
    }
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        },
    )
    console.log(chalk.bgGreen.white.bold(`The deposit was successful: R$${amount}`))
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8', 
        flag : 'r' 
    })
    return JSON.parse(accountJSON) 
}

function withdraw(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'What is the name on your account?'
        }    
    ]).then((answer) => {
        const accountName = answer['accountName']
        if(!checkAccount(accountName)){
            return withdraw()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Enter the amount you would like to withdraw:'
            }
        ]).then((answer) => {
            const amount = answer['amount']
            console.log(chalk.bgHex('#003366').white(`Amount to withdraw: R$${amount}`)) 
            removeAmount(accountName, amount)

        }).catch(err => console.log(err))

    }).catch(err => console.log(err))
}
 
function removeAmount(accountName, amount){
    const accountData = getAccount(accountName)
    if(!amount){
        console.log(chalk.bgRed.white.bold('ERROR! Please try again.'))
        return withdraw()
    }
    if(accountData.balance < amount){
        console.log(chalk.bgRed.white.bold('Amount not available!'))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
    fs.writeFileSync(
        `accounts/${accountName}.json`, 
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        }
    )
    console.log(chalk.bgGreen.black.bold(`You have withdrawn the amount of: R$${amount}`))
    Operation()
}

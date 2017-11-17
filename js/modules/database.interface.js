/**
 * Created with JetBrains PhpStorm.
 * Date: 11/8/17
 * Time: 11:44 AM
 * To change this template use File | Settings | File Templates.
 */
var SQL = require('sql.js')
const path = require('path')
const fs = require('fs')
//var SQL = new sqlite3.Database(':walletjs:');

let _placeHoldersString = function (length) {
    let places = ''
    for (let i = 1; i <= length; i++) {
        places += '?, '
    }
    return /(.*),/.exec(places)[1]
}

SQL.dbOpen = function (databaseFileName) {
    try {
        return new SQL.Database(fs.readFileSync(databaseFileName))
    } catch (error) {
        console.log("Can't open database file.", error.message)
        return null
    }
}

SQL.dbClose = function (databaseHandle, databaseFileName) {
    try {
        let data = databaseHandle.export()
        let buffer = new Buffer(data)
        fs.writeFileSync(databaseFileName, buffer)
        databaseHandle.close()
        return true
    } catch (error) {
        console.log("Can't close database file.", error)
        return null
    }
}

module.exports.initDb = function (appPath, callback) {

    console.log("Application folder is:"+appPath);

    if (fs.existsSync(appPath)) {
        // Do something
        try{
            fs.accessSync(appPath+'/main.db', fs.R_OK | fs.W_OK)
            console.log("Database file exists");
        }catch(e){
            fs.writeFileSync(appPath+'/main.db', '');
            console.log("Create new database file");
        }

    } else {
        fs.mkdir(appPath);
        fs.writeFileSync(appPath+'/main.db', '');

    }

    let dbPath = path.join(appPath, 'main.db')
    let createDb = function (dbPath) {
        // Create a database.
        let db = new SQL.Database()

        let query = fs.readFileSync(
            path.join(__dirname, '../../db', 'schema.sql'), 'utf8')
        let result = db.exec(query)
        if (Object.keys(result).length === 0 &&
            typeof result.constructor === 'function' &&
            SQL.dbClose(db, dbPath)) {
            console.log('Created a new database.')
        } else {
            console.log('model.initDb.createDb failed.')
        }
    }
    let db = SQL.dbOpen(dbPath)
    if (db === null) {
        /* The file doesn't exist so create a new database. */
        createDb(dbPath)
    } else {
        /*
         The file is a valid sqlite3 database. This simple query will demonstrate
         whether it's in good health or not.
         */
        let query = 'SELECT count(*) as `count` FROM `sqlite_master`'
        let row = db.exec(query)
        let tableCount = parseInt(row[0].values)
        if (tableCount === 0) {
            console.log('The file is an empty SQLite3 database.')
            createDb(dbPath)
        } else {
            console.log('The database has', tableCount, 'tables.')
        }
        if (typeof callback === 'function') {
            callback()
        }
    }
}

module.exports.saveFormData = function (tableName, keyValue, callback) {
    if (keyValue.columns.length > 0) {
        let db = SQL.dbOpen(window.model.db)
        if (db !== null) {
            let query = 'INSERT OR REPLACE INTO `' + tableName
            query += '` (`' + keyValue.columns.join('`, `') + '`)'
            query += ' VALUES (' + _placeHoldersString(keyValue.values.length) + ')'
            let statement = db.prepare(query)
            try {
                if (statement.run(keyValue.values)) {
                    $('#' + keyValue.columns.join(', #'))
                        .addClass('form-control-success')
                        .animate({class: 'form-control-success'}, 1500, function () {
                            if (typeof callback === 'function') {
                                callback()
                            }
                        })
                } else {
                    console.log('model.saveFormData', 'Query failed for', keyValue.values)
                }
            } catch (error) {
                console.log('model.saveFormData', error.message)
            } finally {
                SQL.dbClose(db, window.model.db)
            }
        }
    }
}

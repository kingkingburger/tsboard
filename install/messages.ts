/**
 * install/welcome.ts
 *
 * 설치 실행 시 보여줄 메시지들 모음, 콘솔 화면에 출력을 위해 chalk 사용
 */
import chalk from "chalk"

export const env = `#
# TSBOARD 서버쪽 설정 파일
# 클라이언트쪽 설정은 vite.config.ts 참조
# 
# 참조1 - 서버쪽 mysqld.sock 파일 경로는 시스템마다 상이하므로 따로 확인 필요 (DB_SOCK_PROD)
# 참조2 - 메일 자동 발송을 위해 구글 메일 계정 필요하며, 맨 아래 참고) 부분을 꼭 따라해야 함
#
# 하다가 어려움이 있을 땐? tsboard.dev 방문!
# 
SERVER_PORT=3100
MAX_FILE_SIZE=10247680

# 데이터베이스 세팅 (각 서버 설정에 맞게 변경 필요)
DB_HOST=#dbhost#
DB_USER=#dbuser#
DB_PASS=#dbpass#
DB_NAME=#dbname#
DB_TABLE_PREFIX=#dbprefix#
DB_SOCK_PATH=#dbsock#

# JWT 비밀 키
JWT_SECRET_KEY=#jwtsecret#

# GMAIL OAUTH (이메일 발송 기능에 사용되며, 빈 값으로 둘 경우 해당 기능을 쓸 수 없습니다.)
# 참고) https://iamiet.tistory.com/entry/Nodemailer-Gmail-OAuth20%EC%9C%BC%EB%A1%9C-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EB%B0%9C%EC%86%A1%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0
GMAIL_OAUTH_USER=                # Oauth Client에서 테스트 사용자로 등록된 이메일 주소
GMAIL_OAUTH_CLIENT_ID=           # OAuth Client의 아이디
GAMIL_OAUTH_CLIENT_SECRET=       # OAuth Client의 보안 비밀번호
GAMIL_OAUTH_REFRESH_TOKEN=       # playground에서 발급받은 리프레쉬 토큰`

const foundEnvTitle = `
 __                       _                    
/ _|                     | |                   
| |_ ___  _   _ _ __   __| |    ___ _ ____   __
|  _/ _ \\| | | | '_ \\ / _\` |   / _ \\ '_ \\ \\ / /
| || (_) | |_| | | | | (_| |  |  __/ | | \\ V / 
|_| \\___/ \\__,_|_| |_|\\__,_| (_)___|_| |_|\\_/  `
export const foundEnv = chalk.red.bold(foundEnvTitle)

const welcomeTitle = `
 _       _                         _ 
| |_ ___| |__   ___   __ _ _ __ __| |
| __/ __| '_ \\ / _ \\ / _\` | '__/ _\` |
| |_\\__ \\ |_) | (_) | (_| | | | (_| |
 \\__|___/_.__/ \\___/ \\__,_|_|  \\__,_|`
export const welcome = `${chalk.cyan.bold(welcomeTitle)}

v0.8.0 | tsboard.dev | ${chalk.gray("Currently only available in Korean.")}

✓ TSBOARD 설치 화면에 오신 것을 환영합니다!
  이 프로그램 설치를 위해 아래 Github 페이지에서 
  설치와 관련된 도움말을 확인 하실 수 있습니다.

  ${chalk.bgBlack.bold("https://github.com/sirini/tsboard")}

  도움이 필요할 땐 언제든지 ${chalk.yellow.bold("tsboard.dev")} 에 와주세요!

✓ 추가로, 설치 후에 아래 항목들도 꼭 ${chalk.yellow.bold(".env")} 파일에서 수정해 주세요!

  ${chalk.gray("GMAIL_OAUTH_USER")}
  ${chalk.gray("GMAIL_OAUTH_CLIENT_ID")}
  ${chalk.gray("GAMIL_OAUTH_CLIENT_SECRET")}
  ${chalk.gray("GAMIL_OAUTH_REFRESH_TOKEN")}
`

const installTitle = `
 _           _        _ _       
(_)         | |      | | |      
 _ _ __  ___| |_ __ _| | |      
| | '_ \\/ __| __/ _\` | | |      
| | | | \\__ \\ || (_| | | |_ _ _ 
|_|_| |_|___/\\__\\__,_|_|_(_|_|_)`
export const install = `${chalk.gray.bold(installTitle)}

${chalk.yellow.bold(".env")} 파일에 입력해주신 MySQL(Maria) DBMS 정보를 저장하고
데이터베이스 및 테이블들을 추가합니다...
`

const completeTitle = `
     _                       ___  
    | |                     |__ \\ 
  __| | ___  _ __   ___        ) |
 / _\` |/ _ \\| '_ \\ / _ \\      / / 
| (_| | (_) | | | |  __/_ _ _|_|  
 \\__,_|\\___/|_| |_|\\___(_|_|_|_)  `
export const complete = `${chalk.green.bold(completeTitle)}

축하합니다!\n
입력해주신 내용들을 참조하여 #dbname# 데이터베이스 및 
#dbprefix# 로 시작하는 여러 테이블들을 생성하였습니다.

${chalk.bold("이제 거의 다 왔습니다.")}\n
아래 페이지에서 설치 마무리 및 TSBOARD 실행 관련 내용을 확인해 주세요!

${chalk.bgBlack.bold("https://github.com/sirini/tsboard")}

혹은, 도움이 필요할땐 언제든지 ${chalk.yellow.bold("tsboard.dev")} 에 방문해 주세요!\n
`

/* eslint-disable */
export const printANSI = () => {
  // ASCII - ANSI Shadow
  let text = `

   __      _            _                 _
  / _|    (_)          | |               | |
 | |_ __ _ _ _ __ _   _| | __ _ _ __   __| |
 |  _/ _\` | | '__| | | | |/ _\` | '_ \\ / _\` |
 | || (_| | | |  | |_| | | (_| | | | | (_| |
 |_| \\__,_|_|_|   \\__, |_|\\__,_|_| |_|\\__,_|
                   __/ |
                  |___/

\t\t\t\t\t
\t\t\t\t\t
\t\t\t\t\t
\t\t\t\t\t`
  console.log(`%c${text}`, 'color: #fc4d50')
  console.log(
    '%c感谢您对这款游戏的支持!',
    'color: #000; font-size: 14px;    font-family: Hiragino Sans GB,Microsoft YaHei,\\\\5FAE\\8F6F\\96C5\\9ED1,Droid Sans Fallback,Source Sans,Wenquanyi Micro Hei,WenQuanYi Micro Hei Mono,WenQuanYi Zen Hei,Apple LiGothic Medium,SimHei,ST Heiti,WenQuanYi Zen Hei Sharp,sans-serif;'
  )
  console.log(
    '%cThank you for supporting this game!',
    'color: #fff; font-size: 14px; font-weight: 300; text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;'
  )
}

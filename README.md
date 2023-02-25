# coc-paste-pandoc

paste clipboard contents with pandoc transform for `coc.nvim`

## Install

```vim
:CocInstall coc-paste-pandoc
```

## Keymaps

```vim
" paste as github flavored markdown
nnoremap <silent> <leader>pp <Plug>(coc-paste-pandoc-gfm)
" paste as html
nnoremap <silent> <leader>ph <Plug>(coc-paste-pandoc-html)
```

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

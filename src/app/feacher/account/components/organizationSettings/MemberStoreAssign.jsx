"use client";

import { useEffect, useState } from "react";
import { Box, Button, Checkbox, HStack, Text, VStack, Wrap } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { setMemberStores } from "@/app/api/supabaseFunctions/supabaseDatabase/memberStores/action";
import { showToast } from "@/functions/makeToast/toast";

/**
 * 1 人の担当店舗を割り当てる（011）。
 *
 * ⚠️ **管理者には出さない。** 管理者は常に全店舗で、`member_stores` に行を持たない。
 *    出すと「未設定」に見えて、割り当てようとした管理者が 400 を受け取る。
 *
 * ⚠️ **0 件で保存できるようにしておく。** 担当を全部外す＝その人は集金も在庫も
 *    何も見えなくなる、という**意図した操作**があるため。押しにくくはするが
 *    禁止はしない（禁止すると「辞めた人を閲覧者にして担当を外す」ができない）。
 *
 * ⚠️ **保存は置き換え。** 差分ではないので、画面に出ている状態がそのまま次の担当になる。
 */
export default function MemberStoreAssign({ userId, userName, stores, assigned, onChanged }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(assigned ?? []);
  const [saving, setSaving] = useState(false);

  /*
    ⚠️ **依存に配列そのものを置かない。** 親は保存のたびに一覧を取り直すので、
       中身が同じでも新しい参照が来て**選択中のチェックが戻る。**
       文字列に畳んでから比べる（アプリ側の同じ罠と同じ対処）。
  */
  const assignedKey = (assigned ?? []).join(",");
  useEffect(() => {
    setSelected(assigned ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedKey]);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = async () => {
    setSaving(true);
    const { error } = await setMemberStores(userId, selected);
    if (error) {
      showToast("error", error);
    } else {
      showToast(
        "success",
        selected.length === 0
          ? `${userName}の担当店舗をすべて解除しました`
          : `${userName}の担当店舗を更新しました`
      );
      onChanged?.();
      setOpen(false);
    }
    setSaving(false);
  };

  const count = (assigned ?? []).length;

  return (
    <Box mt={2} pt={2} borderTop="1px solid" borderColor="var(--divider, #F1F5F9)">
      <HStack
        as="button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        w="full"
        justify="space-between"
        aria-expanded={open}
      >
        <HStack gap={2}>
          {/* ⚠️ Icon.js は再エクスポートの許可制。LuStore は入っていない */}
          <Icon.LuBuilding2 size={13} color="var(--teal, #0891B2)" />
          <Text fontSize="xs" color="var(--text-muted, #64748B)">
            担当店舗
          </Text>
          {/* ⚠️ 0 件は目立たせる。この人は集金も在庫も何も見えない状態 */}
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={count === 0 ? "orange.600" : "var(--teal-deeper, #155E75)"}
          >
            {count === 0 ? "未設定（何も見えません）" : `${count}店舗`}
          </Text>
        </HStack>
        {open ? <Icon.LuChevronUp size={14} /> : <Icon.LuChevronDown size={14} />}
      </HStack>

      {open && (
        <VStack align="stretch" gap={2} mt={2}>
          {stores.length === 0 ? (
            <Text fontSize="xs" color="var(--text-muted, #64748B)">
              店舗がまだありません
            </Text>
          ) : (
            <>
              <Wrap gap={2}>
                {stores.map((store) => (
                  <Checkbox.Root
                    key={store.id}
                    checked={selected.includes(store.id)}
                    onCheckedChange={() => toggle(store.id)}
                    disabled={saving}
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label fontSize="xs">{store.store}店</Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </Wrap>

              {/* ⚠️ 新しく作った店舗は自動では配られない。ここで気づけるようにしておく */}
              <Text fontSize="10px" color="var(--text-faint, #94A3B8)">
                店舗を新しく登録しても自動では割り当てられません。ここで選び直してください。
              </Text>

              <HStack justify="flex-end" gap={2}>
                <Button size="xs" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
                  やめる
                </Button>
                <Button
                  size="xs"
                  colorPalette="cyan"
                  onClick={save}
                  loading={saving}
                  loadingText="保存中..."
                >
                  保存
                </Button>
              </HStack>
            </>
          )}
        </VStack>
      )}
    </Box>
  );
}
